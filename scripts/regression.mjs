import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {load} from 'cheerio';
import {convert} from 'html-to-text';
import {configureWorkflow} from './workflow-lib.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const w=JSON.parse(fs.readFileSync(path.join(root,'workflow.configurable.json'),'utf8'));
const node=name=>w.nodes.find(n=>n.name===name);
const clone=v=>JSON.parse(JSON.stringify(v));
const cfg=JSON.parse(fs.readFileSync(path.join(root,'config.example.json'),'utf8'));
Object.assign(cfg,{configuracionLista:true,fuenteAutorizada:true,googleSheetId:'documento_sintetico_para_pruebas',telegramChatId:'12345',geminiModel:'modelo-sintetico',perfilesObjetivo:[{id:'ventas',nombre:'Ventas',descripcion:'Atención comercial'}],busquedas:[{keyword:'Ventas',categoria:'ventas'}]});
cfg.catalogoCv={candidato:{id:'prueba',nombre:'Persona ficticia',titulo:'Ventas',resumen:'Perfil sintético',ubicacion:'Santiago'},experienciaProfesionalMesesAprox:12,experiencias:[],proyectos:[],certificaciones:[],habilidades:{Competencias:['Ventas']},educacion:{titulo:'Estudios sintéticos'},idiomas:[],criteriosEvidencia:[]};
let checks=0;
function test(name,fn){const saved=clone(cfg);try{fn();checks++;console.log('OK '+name);}finally{Object.assign(cfg,saved);}}
function run(name,items=[],refs={}){
  const arr=items.map(json=>({json}));
  const $=key=>{if(key!=='Configuración' && !(key in refs))throw Error('Referencia no simulada: '+key);const values=key==='Configuración'?[cfg]:Array.isArray(refs[key])?refs[key]:[refs[key]];return {first:()=>({json:values[0]}),item:{json:values[0]},all:()=>values.map(json=>({json}))};};
  return clone(vm.runInNewContext('(function(){'+node(name).parameters.jsCode+'})()',{$input:{all:()=>arr,item:arr[0],first:()=>arr[0]},$,$json:items[0]},{timeout:1000}));
}
// Semántica de Html 1.2: selectores Cheerio, html-to-text, atributos opcionales.
// https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/nodes/Html/utils.ts
function extract(name,html){
  const $=load(html),result={};
  for(const field of node(name).parameters.extractionValues.values){
    const selected=$(field.cssSelector);
    const value=el=>field.returnValue==='html'?el.html()||undefined:field.returnValue==='attribute'?el.attr(field.attribute):convert(el.html()||'');
    result[field.key]=field.returnArray?selected.toArray().map(el=>value($(el))):value(selected);
  }
  return result;
}
const fixture=name=>fs.readFileSync(path.join(root,'tests','fixtures',name+'.html'),'utf8');
function search(html,keyword='Ventas'){
  const guard=run('Validar búsqueda',[{data:html}]).json;
  const cards=run('Separar tarjetas',[extract('Extraer tarjetas',html)],{'Validar búsqueda':guard});
  const tags=cards.map(card=>run('Etiquetar búsqueda',[extract('Extraer resultados',card.json.data)],{'Buscar cada cargo':{keyword,categoria:'ventas',orden:0},'Separar tarjetas':card.json}).json);
  return run('Unir resultados',tags);
}
const offer=(id,extra={})=>({id_externo:id,titulo:'Ejecutivo de ventas',empresa:'Empresa sintética',ubicacion:'Santiago',url:'https://www.linkedin.com/jobs/view/123456789/',categoria_origen:'ventas',categorias_origen:['ventas'],fecha_deteccion:'2026-09-06T12:00:00Z',fecha_publicacion:'2026-09-06',...extra});
const history=rows=>run('IDs existentes',rows)[0].json;
const queue=(offers,rows=[])=>run('Marcar ofertas nuevas',[],{'IDs existentes':history(rows),'Eliminar duplicados del lote':offers});
const detail=(item,description)=>run('Completar oferta',[{descripcion:description}],{'Conservar oferta':{_original:item}}).json;
const validText='Funciones de ventas y atención comercial. '.repeat(10);
test('Los campos ausentes no se desplazan entre tarjetas HTML',()=>{
  const rows=search(fixture('search-partial')).map(i=>i.json);
  assert.deepEqual(rows.map(r=>[r.titulo,r.empresa,r.ubicacion,r.fecha_publicacion]),[['Oferta A','','Santiago','2026-09-06'],['Oferta B','Empresa B','Valparaíso',''],['Oferta C','Empresa C','','']]);
  assert.ok(rows[1].url.includes('222222222'));assert.equal(rows[2].keyword_origen,'Ventas');
});
test('Tarjeta sin URL falla explícitamente, no mezcla otra URL',()=>assert.throws(()=>search(fixture('search-partial').replace('class="base-card__full-link"','class="enlace-cambiado"')),/tarjeta sin título o URL/));
test('Búsqueda vacía reconocida y respuesta guest vacía terminan sin ofertas',()=>{
  assert.deepEqual(search(fixture('search-empty')),[]);assert.deepEqual(search(' \n\t'),[]);
});
test('Login y HTML desconocido no se interpretan como cero ofertas',()=>{
  assert.throws(()=>search(fixture('search-login')),/autenticación o bloqueo/);
  assert.throws(()=>search(fixture('search-changed')),/no reconocido/);
  assert.throws(()=>search('<html><title>Sign in</title></html>'),/no reconocido/);
});
test('Bloqueo prevalece sobre marcador de resultados vacíos',()=>assert.throws(()=>search(fixture('search-empty')+fixture('search-login')),/autenticación o bloqueo/));
test('Un selector de tarjetas roto falla aunque la respuesta parezca válida',()=>assert.throws(()=>run('Separar tarjetas',[{tarjetas:[]}],{'Validar búsqueda':{_busquedaVacia:false}}),/selector/));
test('El centinela de búsqueda vacía conserva la vuelta del bucle',()=>{
  const rows=run('Separar tarjetas',[{tarjetas:[]}],{'Validar búsqueda':{_busquedaVacia:true}});
  assert.equal(rows.length,1);assert.equal(rows[0].json._sinResultados,true);assert.deepEqual(rows[0].pairedItem,{item:0});
});
test('Una descripción corta no consume el cupo de IA y queda registrada',()=>{
  const selected=queue([offer('bad'),offer('good',{fecha_publicacion:'2026-09-05'})]);
  const details=selected.map(i=>detail(i.json,i.json.id_externo==='bad'?'Breve':validText));
  const result=run('Filtrar detalles válidos',details);
  assert.deepEqual(result.map(i=>[i.json.id_externo,i.json._omitirIa]),[['bad',true],['good',false]]);
  const row=run('Registrar descarte de detalle',[result[0].json]).json;
  assert.equal(row.estado,'DETALLE_INSUFICIENTE');assert.equal(row.score,0);
  assert.deepEqual(queue([offer('bad'),offer('good')],[row]).map(i=>i.json.id_externo),['good']);
});
test('El operador puede volver a intentar un detalle corregido',()=>{
  const pending={id_externo:'bad',estado:'ERROR_DETALLE'};
  assert.equal(queue([offer('bad')],[pending]).length,1);
});
test('Se respetan límites separados y no se marcan procesadas las válidas aplazadas',()=>{
  cfg.maxDetallesPorEjecucion=3;cfg.maxOfertasPorEjecucion=1;
  const selected=queue(Array.from({length:8},(_,i)=>offer('id'+i)));
  assert.equal(selected.length,3);
  const processed=run('Filtrar detalles válidos',selected.map(i=>detail(i.json,validText)));
  assert.equal(processed.length,1);assert.equal(processed[0].json._omitirIa,false);
  assert.equal(queue([offer('id1')],[{...processed[0].json,estado:'DESCARTADA'}]).length,1);
});
test('Práctica descubierta en detalle se registra y deja pasar otra oferta',()=>{
  const details=[detail(offer('practice'),validText+' Requiere seguro escolar.'),detail(offer('normal'),validText)];
  const rows=run('Filtrar detalles válidos',details);
  assert.equal(rows[0].json._motivoDetalle,'PRACTICA_EXCLUIDA');assert.equal(rows[1].json._omitirIa,false);
});
test('La categoría pendiente recibe turno en el ciclo siguiente',()=>{
  cfg.busquedas.push({keyword:'Logística',categoria:'logistica'});
  const rows=[],turns=[];
  for(let i=0;i<4;i++){
    const offers=[offer('ventas-'+i),offer('logistica-'+i,{categoria_origen:'logistica',categorias_origen:['logistica']})];
    const selected=queue(offers,rows)[0].json;
    turns.push(selected.categoria_seleccionada);
    rows.push({...selected,estado:'DESCARTADA',fecha_deteccion:new Date(Date.UTC(2026,8,6,12+i)).toISOString()});
  }
  assert.deepEqual(turns,['ventas','logistica','ventas','logistica']);
});
test('Rotación considera también ERROR_IA y rechazos de detalle',()=>{
  cfg.busquedas.push({keyword:'Logística',categoria:'logistica'});
  const rows=[{categoria_seleccionada:'ventas',fecha_deteccion:'2026-09-06',estado:'ERROR_IA'}];
  assert.equal(queue([offer('a'),offer('b',{categoria_origen:'logistica',categorias_origen:['logistica']})],rows)[0].json.categoria_seleccionada,'logistica');
});
test('Remoto en la descripción pasa aunque la tarjeta indique otra ciudad',()=>{
  const original=offer('remote',{ubicacion:'Valparaíso, Chile'});
  assert.equal(queue([original]).length,1);
  const result=detail(original,validText+' Trabajo 100% remoto desde cualquier ciudad de Chile.');
  assert.equal(result.modalidad,'Remoto');assert.equal(result.detalle_valido,true);
});
test('Presencial fuera de zona queda descartado después de leer el detalle',()=>{
  const result=detail(offer('onsite',{ubicacion:'Valparaíso'}),validText+' Trabajo presencial.');
  assert.equal(result.detalle_valido,false);assert.equal(result._motivoDetalle,'FUERA_DE_ZONA');
});
test('Remoto desactivado no amplía la zona permitida',()=>{
  cfg.aceptarRemoto=false;
  assert.equal(queue([offer('remote',{ubicacion:'Valparaíso'})]).length,0);
  assert.equal(detail(offer('remote',{ubicacion:'Valparaíso'}),validText+' Remoto.')._motivoDetalle,'FUERA_DE_ZONA');
});
test('Configuración preserva literalmente todas las secuencias de sustitución',()=>{
  for(const value of ['$&',"$'",'$`','$$','comillas " y barra \\']){
    cfg.catalogoCv.candidato.resumen=value;
    const built=configureWorkflow(clone(w),cfg,root);
    const code=built.nodes.find(n=>n.name==='Configuración').parameters.jsCode;
    assert.equal(vm.runInNewContext('(function(){'+code+'})()',{}, {timeout:1000})[0].json.catalogoCv.candidato.resumen,value);
  }
});
test('Configuración rechaza límite de detalle inferior al de IA',()=>{
  cfg.maxOfertasPorEjecucion=5;cfg.maxDetallesPorEjecucion=2;
  const built=configureWorkflow(clone(w),cfg,root);
  assert.throws(()=>vm.runInNewContext('(function(){'+built.nodes.find(n=>n.name==='Configuración').parameters.jsCode+'})()',{}, {timeout:1000}),/maxDetallesPorEjecucion/);
});
test('Los dos mensajes Telegram usan HTML seguro sin entidades cortadas',()=>{
  for(const name of ['Avisar por Telegram','Avisar match sin PDF']){
    const params=node(name).parameters;
    assert.equal(params.additionalFields.parse_mode,'HTML');
    const j={...offer('x'),score:80,titulo:'A_*[x] </b><script>x</script>&',empresa:'&'.repeat(200),ubicacion:'<'.repeat(100),requisitos_faltantes:'>'.repeat(300)};
    const expr=params.text||params.additionalFields.caption;
    const text=vm.runInNewContext(expr.slice(3,-2),{$:key=>({first:()=>({json:cfg}),item:{json:j}})},{timeout:1000});
    assert.ok(!text.includes('<script>'));assert.ok(text.includes('&lt;script&gt;'));
    const $=load('<div id="message">'+text+'</div>');
    assert.equal($('#message').children().length,0);
    assert.ok($('#message').text().includes(j.titulo));assert.ok($('#message').text().length<=950);
  }
});
test('El grafo envía los descartes a Sheets y evita Gemini',()=>{
  assert.equal(w.connections['¿Requiere IA?'].main[0][0].node,'Conservar antes de Gemini');
  assert.equal(w.connections['¿Requiere IA?'].main[1][0].node,'Registrar descarte de detalle');
  assert.deepEqual(w.connections['Registrar descarte de detalle'].main[0].map(e=>e.node),['Preparar fila para Sheets','Esperar guardado']);
  assert.equal(node('¿Requiere IA?').parameters.conditions.conditions[0].leftValue,'={{ $json._omitirIa }}');
  assert.equal(node('¿Requiere IA?').parameters.conditions.conditions[0].operator.operation,'false');
});
test('Sync idempotente, todas las fuentes y expresiones coinciden con la plantilla',()=>{
  const example=JSON.parse(fs.readFileSync(path.join(root,'config.example.json'),'utf8'));
  assert.deepEqual(configureWorkflow(clone(w),example,root),w);
});
test('CLI genera el workflow privado, valida y evita sobrescribir',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'job-alerts-test-'));
  // Copia solo archivos del proyecto; no ejecuta dependencias ni servicios.
  for(const dir of ['src','scripts'])fs.cpSync(path.join(root,dir),path.join(temp,dir),{recursive:true});
  fs.copyFileSync(path.join(root,'workflow.configurable.json'),path.join(temp,'workflow.configurable.json'));
  cfg.catalogoCv.candidato.resumen="Datos $& $' $\u0060 $$";
  const configPath=path.join(temp,'config.local.json');fs.writeFileSync(configPath,JSON.stringify(cfg));
  const cli=()=>spawnSync(process.execPath,[path.join(temp,'scripts','configure.mjs'),configPath],{encoding:'utf8'});
  const first=cli();assert.equal(first.status,0,first.stderr);
  const output=fs.readFileSync(path.join(temp,'private','workflow.json'),'utf8');
  assert.equal(JSON.parse(output).active,false);
  const code=JSON.parse(output).nodes.find(n=>n.name==='Configuración').parameters.jsCode;
  assert.equal(vm.runInNewContext('(function(){'+code+'})()',{}, {timeout:1000})[0].json.catalogoCv.candidato.resumen,cfg.catalogoCv.candidato.resumen);
  assert.notEqual(cli().status,0);assert.equal(fs.readFileSync(path.join(temp,'private','workflow.json'),'utf8'),output);
  // No borrado recursivo: el directorio temporal solo contiene datos sintéticos.
});
console.log(`\n${checks} regresiones aprobadas. HTML con parsers reales; n8n y proveedores no ejecutados.`);
