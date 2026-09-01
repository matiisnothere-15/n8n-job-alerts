import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const w=JSON.parse(fs.readFileSync(path.join(root,'workflow.configurable.json'),'utf8'));
const node=name=>w.nodes.find(n=>n.name===name);
const cfg=JSON.parse(fs.readFileSync(path.join(root,'config.example.json'),'utf8'));
const jsonClone=v=>JSON.parse(JSON.stringify(v));
let checks=0;
const test=(name,fn)=>{fn();checks++;console.log('OK '+name);};
const run=(name,items=[],refs={})=>{
  const arr=items.map(json=>({json}));
  const $=key=>{
    if(key==='Configuración')return {first:()=>({json:cfg})};
    if(!(key in refs))throw new Error('Referencia no simulada: '+key);
    const data=Array.isArray(refs[key])?refs[key]:[refs[key]];
    return {first:()=>({json:data[0]}),item:{json:data[0]},all:()=>data.map(json=>({json}))};
  };
  return jsonClone(vm.runInNewContext('(function(){'+node(name).parameters.jsCode+'})()',{$input:{all:()=>arr,item:arr[0],first:()=>arr[0]},$,$json:items[0]},{timeout:1000}));
};
const expr=(value,j={},refs={})=>vm.runInNewContext(value.slice(3,-2),{$json:j,$:key=>({first:()=>({json:key==='Configuración'?cfg:refs[key]}),item:{json:refs[key]}})},{timeout:1000});
test('JSON inactivo, 38 nodos únicos y sin credenciales',()=>{
  assert.equal(w.active,false); assert.equal(w.nodes.length,38);
  assert.equal(new Set(w.nodes.map(n=>n.id)).size,w.nodes.length);
  for(const n of w.nodes)assert.equal(n.credentials,undefined);
  assert.deepEqual(w.pinData,{});
});
test('Conexiones sin destinos inexistentes',()=>{
  for(const [name,links] of Object.entries(w.connections)){
    assert.ok(node(name)); for(const branches of Object.values(links))for(const branch of branches)for(const e of branch)assert.ok(node(e.node),e.node);
  }
});
test('Sintaxis de todos los nodos Code',()=>{for(const n of w.nodes)if(n.type==='n8n-nodes-base.code')new vm.Script('(function(){'+n.parameters.jsCode+'})');});
test('Plantilla se detiene antes de usar servicios',()=>assert.throws(()=>run('Configuración'),/Configuración/));
test('Fuentes JS sincronizadas',()=>{
  for(const [name,file] of [['Analizar respuesta IA','analyze.js'],['Construir CV LaTeX','cv.js']])assert.equal(node(name).parameters.jsCode,fs.readFileSync(path.join(root,'src',file),'utf8'));
});
// Datos sintéticos, no pertenecen a una persona real.
cfg.configuracionLista=true;cfg.fuenteAutorizada=true;
cfg.googleSheetId='documento_sintetico_para_pruebas';cfg.geminiModel='modelo-sintetico';cfg.telegramChatId='12345';
cfg.perfilesObjetivo=[{id:'qa',nombre:'QA',descripcion:'Pruebas funcionales'}];
cfg.busquedas=[{keyword:'QA tester',categoria:'qa'}];
cfg.catalogoCv={candidato:{id:'test',nombre:'Persona de prueba',titulo:'Perfil técnico',resumen:'Perfil sintético de prueba.',ubicacion:'Santiago'},experienciaProfesionalMesesAprox:3,
 experiencias:[{id:'exp1',cargo:'QA',empresa:'Empresa de prueba',fechas:'2025',bullets:[{id:'b1',texto:'Ejecuté pruebas funcionales.'}]},{id:'exp2',cargo:'Desarrollo',empresa:'Empresa de prueba',fechas:'2025',bullets:[{id:'b2',texto:'Implementé una API.'}]}],
 proyectos:[{id:'p1',nombre:'Proyecto de prueba',descripcion:'Proyecto sintético',tecnologias:'Java'}],habilidades:{Tecnologías:['Java','Git']},certificaciones:[],educacion:{titulo:'Estudios de prueba'},idiomas:[{idioma:'Español',nivel:'Nativo'}],criteriosEvidencia:[]};
test('Configuración completa válida',()=>{
  const code=fs.readFileSync(path.join(root,'src/config-guard.js'),'utf8').replace('const config = {};','const config = '+JSON.stringify(cfg)+';');
  assert.equal(vm.runInNewContext('(function(){'+code+'})()',{}, {timeout:1000})[0].json.catalogoCv.candidato.id,'test');
});
const jobs=[{titulo:'QA trainee',url:'https://cl.linkedin.com/jobs/view/qa-trainee-4459762468?x=1',keyword_origen:'QA',categoria_origen:'qa'},
{titulo:'QA trainee',url:'https://www.linkedin.com/jobs/view/4459762468/',keyword_origen:'tester',categoria_origen:'qa'}];
test('Deduplicación de URL con slug y URL canónica',()=>{const r=run('Eliminar duplicados del lote',jobs);assert.equal(r.length,1);assert.equal(r[0].json.id_externo,'linkedin-4459762468');assert.equal(r[0].json.keywords_origen.length,2);});
test('URL de otro dominio y títulos vacíos se rechazan',()=>{assert.throws(()=>run('Eliminar duplicados del lote',[{titulo:'x',url:'https://evil.example/jobs/view/4459762468'}]),/ninguna/);assert.throws(()=>run('Eliminar duplicados del lote',[{titulo:'',url:jobs[0].url}]),/ninguna/);});
test('Sin ofertas produce una salida vacía legítima',()=>assert.deepEqual(run('Eliminar duplicados del lote',[]),[]));
test('Sheets lee una vez y los errores no se ocultan',()=>{assert.equal(node('Leer ofertas guardadas').executeOnce,true);for(const name of ['Leer ofertas guardadas','Guardar en Google Sheets'])assert.equal(node(name).onError,'stopWorkflow');});
test('IDs ERROR_IA son reintentables, otros ya procesados no',()=>{const r=run('IDs existentes',[{id_externo:'1',estado:'ERROR_IA'},{id_externo:'2',estado:'DESCARTADA'}]);assert.deepEqual(r[0].json.idsExistentes,['2']);});
test('Límite de análisis, exclusión de prácticas y deduplicado persistente',()=>{
  const refs={'IDs existentes':{idsExistentes:['old']},'Eliminar duplicados del lote':[{id_externo:'old',titulo:'QA junior',ubicacion:'Santiago',categoria_origen:'qa'},{id_externo:'new',titulo:'QA junior',ubicacion:'Santiago',categoria_origen:'qa'},{id_externo:'intern',titulo:'Práctica QA',ubicacion:'Santiago',categoria_origen:'qa'}]};
  const r=run('Marcar ofertas nuevas',[],refs);assert.equal(r.length,1);assert.equal(r[0].json.id_externo,'new');
});
const job={id_externo:'linkedin-4459762468',titulo:'QA Junior',descripcion:'Pruebas funcionales de software y uso de Git. '.repeat(10),url:jobs[1].url,ubicacion:'Santiago',empresa:'Empresa de prueba'};
const p={perfil_cv:'qa',nivel_cargo:'JUNIOR',anos_experiencia_requeridos:null,acepta_junior:true,es_practica:false,
 requisitos_obligatorios:[{requisito:'Git',tipo:'TECNOLOGIA',cumple:true,evidencia_catalogo:'habilidad:Git',motivo:'Declarada'}],requisitos_deseables:[],
 funciones_similares:[{funcion:'Pruebas funcionales',cumple:true,evidencia_catalogo:'b1'}],bullets_experiencia:['b1','b2'],proyectos_seleccionados:['p1'],habilidades_seleccionadas:['Git'],certificaciones_seleccionadas:[]};
const payload=(data=p)=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(data)}]}}]});
const analyze=(data=payload(),offer=job)=>run('Analizar respuesta IA',[data],{'Conservar antes de Gemini':{_original:offer}}).json;
test('Gemini body JSON y catálogo sin contactos',()=>{const body=JSON.parse(expr(node('Evaluar con Gemini').parameters.jsonBody,job));assert.ok(body.generationConfig.responseJsonSchema);assert.ok(body.systemInstruction.parts[0].text.includes('ID'));assert.ok(!body.contents[0].parts[0].text.includes('Persona de prueba'));});
test('Análisis completo APTO y dos experiencias seleccionadas',()=>{const r=analyze();assert.equal(r.decision,'APTO');assert.equal(r.experiencias_seleccionadas,'exp1, exp2');assert.equal(r.score,82);});
test('400, truncamiento y JSON inválido no generan APTO',()=>{
  for(const data of [{error:{message:'400 INVALID_ARGUMENT'}},{candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:JSON.stringify(p)}]}}]},{candidates:[{finishReason:'STOP',content:{parts:[{text:'invalid'}]}}]}])assert.equal(analyze(data).estado,'ERROR_IA');
});
test('Campo obligatorio ausente y string booleano rechazados',()=>{const a=jsonClone(p);delete a.anos_experiencia_requeridos;assert.equal(analyze(payload(a)).estado,'ERROR_IA');assert.equal(analyze(payload({...p,acepta_junior:'true'})).estado,'ERROR_IA');});
test('Evidencia inexistente nunca cumple una tecnología',()=>{const a=jsonClone(p);a.requisitos_obligatorios[0].evidencia_catalogo='inventada';assert.equal(analyze(payload(a)).decision,'DESCARTAR');});
test('Exigencia de 1 año no se satisface con 3 meses',()=>{const r=analyze(payload({...p,anos_experiencia_requeridos:1}));assert.notEqual(r.decision,'APTO');assert.ok(r.justificacion.includes('12 meses'));});
test('Idioma obligatorio sin evidencia impide APTO',()=>{const a={...p,requisitos_obligatorios:[{requisito:'Francés avanzado',tipo:'IDIOMA',cumple:true,evidencia_catalogo:'idioma:Francés',motivo:'Sin nivel acreditado'}]};assert.notEqual(analyze(payload(a)).decision,'APTO');});
test('Una oferta ajena al objetivo usa OTRO y no genera alerta',()=>{const r=analyze(payload({...p,perfil_cv:'OTRO'}),{...job,titulo:'Trabajo fuera del objetivo'});assert.equal(r.perfil_cv,'OTRO');assert.notEqual(r.decision,'APTO');});
test('26 columnas A:Z y mapeo id_externo',()=>{
  const row=run('Preparar fila para Sheets',[analyze()]).json;
  const cols=fs.readFileSync(path.join(root,'columnas.txt'),'utf8').trim().split('\t');
  assert.equal(cols.length,26);assert.deepEqual(Object.keys(row),cols);
  assert.deepEqual(node('Guardar en Google Sheets').parameters.columns.matchingColumns,['id_externo']);
  for(const key of cols)assert.equal(node('Guardar en Google Sheets').parameters.columns.value[key],'={{ $json.'+key+' }}');
});
test('Protección de fórmulas y rechazo de ID vacío',()=>{assert.equal(run('Preparar fila para Sheets',[{id_externo:'x',empresa:'=IMPORTXML("x")'}]).json.empresa[0],"'");assert.throws(()=>run('Preparar fila para Sheets',[{}]),/id_externo/);});
test('CV usa únicamente selecciones y escapa LaTeX',()=>{
  const result=analyze();cfg.catalogoCv.candidato.nombre='Prueba & {texto}';
  const latex=run('Construir CV LaTeX',[result]).json.cv_latex;
  assert.ok(latex.includes('Ejecuté pruebas funcionales.'));assert.ok(latex.includes('Implementé una API.'));assert.ok(latex.includes('Prueba \\& \\{texto\\}'));
  assert.ok(latex.endsWith('\\end{document}\n'));
});
test('CV admite un perfil sin experiencia laboral',()=>{
  const saved=cfg.catalogoCv.experiencias;cfg.catalogoCv.experiencias=[];
  const r=analyze(payload({...p,bullets_experiencia:[]}));
  const cv=run('Construir CV LaTeX',[r]).json.cv_latex;
  assert.ok(!cv.includes('\\section*{Experiencia}'));cfg.catalogoCv.experiencias=saved;
});
test('Mensajes Telegram acotados y PDF desactivado por defecto',()=>{
  for(const name of ['Avisar por Telegram','Avisar match sin PDF']){
    const params=node(name).parameters;const msg=expr(params.text||params.additionalFields.caption,{}, {'¿Es buen match?':analyze()});assert.ok(msg.length<=950);assert.ok(msg.includes(job.url));
  }
  assert.equal(JSON.parse(fs.readFileSync(path.join(root,'config.example.json'),'utf8')).generarPdf,false);
});
for (const [id,nombre,habilidad] of [
  ['contabilidad','Asistente contable','Conciliación bancaria'],
  ['ventas','Ejecutivo de ventas','Atención al cliente'],
  ['logistica','Operario de bodega','Control de inventario'],
  ['educacion','Asistente de aula','Apoyo pedagógico'],
  ['diseno','Diseñador gráfico','Diseño editorial']
]) test('Perfil configurable de '+nombre+' puede ser APTO',()=>{
  const saved=jsonClone(cfg);
  try {
    cfg.perfilesObjetivo=[{id,nombre,descripcion:'Funciones de '+nombre}];
    cfg.busquedas=[{keyword:nombre,categoria:id}];
    cfg.catalogoCv.habilidades={Competencias:[habilidad]};
    cfg.catalogoCv.experiencias[0].bullets=[{id:'b1',texto:habilidad}];
    const a={...p,perfil_cv:id,nivel_cargo:'OTRO',acepta_junior:false,habilidades_seleccionadas:[habilidad],
      requisitos_obligatorios:[{requisito:habilidad,tipo:'HABILIDAD',cumple:true,evidencia_catalogo:'habilidad:'+habilidad,motivo:'Competencia declarada'}],
      funciones_similares:[{funcion:habilidad,cumple:true,evidencia_catalogo:'b1'}]};
    const oferta={...job,titulo:nombre,descripcion:(habilidad+'. ').repeat(40)};
    const body=JSON.parse(expr(node('Evaluar con Gemini').parameters.jsonBody,oferta));
    assert.deepEqual(body.generationConfig.responseJsonSchema.properties.perfil_cv.enum,[id,'OTRO']);
    assert.ok(body.contents[0].parts[0].text.includes(nombre));
    const r=analyze(payload(a),oferta);assert.equal(r.perfil_cv,id);assert.equal(r.decision,'APTO');
    const searches=run('Cargos buscados');assert.equal(searches[0].json.categoria,id);
    const queued=run('Marcar ofertas nuevas',[],{'IDs existentes':{idsExistentes:[]},'Eliminar duplicados del lote':[{...oferta,categoria_origen:id}]});
    assert.equal(queued[0].json.categoria_seleccionada,id);
  } finally {Object.assign(cfg,saved);}
});
test('Licencia obligatoria no acreditada bloquea la alerta',()=>{
  const a={...p,requisitos_obligatorios:[{requisito:'Licencia profesional vigente',tipo:'LICENCIA',cumple:false,evidencia_catalogo:'Sin evidencia verificada',motivo:'No consta'}]};
  assert.notEqual(analyze(payload(a)).decision,'APTO');
});
test('Categoría inexistente y perfiles repetidos se rechazan',()=>{
  for (const edited of [{...cfg,busquedas:[{keyword:'Cualquier cargo',categoria:'inexistente'}]},{...cfg,perfilesObjetivo:[cfg.perfilesObjetivo[0],cfg.perfilesObjetivo[0]]}]) {
    const code=fs.readFileSync(path.join(root,'src/config-guard.js'),'utf8').replace('const config = {};','const config = '+JSON.stringify(edited)+';');
    assert.throws(()=>vm.runInNewContext('(function(){'+code+'})()',{}, {timeout:1000}),/Configuración/);
  }
});
test('La plantilla pública no exige perfiles de informática',()=>{
  const example=JSON.parse(fs.readFileSync(path.join(root,'config.example.json'),'utf8'));
  assert.equal(example.excluirSenior,false);
  assert.equal(example.perfilesObjetivo[0].id,'perfil_1');
  assert.ok(!/QA_MANUAL|QA_AUTOMATION|BACKEND_JAVA|FRONTEND|FULLSTACK/.test(node('Evaluar con Gemini').parameters.jsonBody+node('Analizar respuesta IA').parameters.jsCode));
});
console.log(`\n${checks} pruebas locales aprobadas. No se contactó a n8n, Google, LinkedIn ni Telegram.`);
