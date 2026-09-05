const c=$('Configuración').first().json;
const history=$('IDs existentes').first().json;
const ids=new Set(history.idsExistentes || []);
const last=history.ultimoTurnoPorCategoria || {};
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const cats=[...new Set(c.busquedas.map(b=>b.categoria))].sort((a,b)=>(last[a]||0)-(last[b]||0));
const groups=Object.fromEntries(cats.map(k=>[k,[]]));
const candidates=$('Eliminar duplicados del lote').all().map(i=>i.json).filter(i=>{
  if (!i.id_externo || ids.has(i.id_externo)) return false;
  const title=norm(i.titulo),zone=norm(i.ubicacion);
  if (c.excluirPracticas && /\b(practica|practicante|pasantia|internship|intern|becario)\b/.test(title)) return false;
  if (c.excluirSenior && /\b(senior|semisenior|sr|ssr|lead|principal|staff|manager|jefe|director|gerente)\b/.test(title)) return false;
  // Con remoto habilitado la ciudad de la tarjeta no basta para descartar.
  return c.aceptarRemoto || !zone || !c.zonasPermitidas.length || c.zonasPermitidas.some(z=>zone.includes(norm(z)));
}).sort((a,b)=>(Date.parse(b.fecha_publicacion)||0)-(Date.parse(a.fecha_publicacion)||0));
for (const item of candidates) {
  const available=(item.categorias_origen||[item.categoria_origen]).filter(k=>Object.hasOwn(groups,k));
  const category=(available.length?available:[cats[0]]).sort((a,b)=>groups[a].length-groups[b].length || cats.indexOf(a)-cats.indexOf(b))[0];
  groups[category].push({...item,categoria_seleccionada:category});
}
const result=[];
while(result.length<c.maxDetallesPorEjecucion){
  let added=false;
  for(const category of cats){
    if(groups[category].length){result.push({json:groups[category].shift()});added=true;}
    if(result.length>=c.maxDetallesPorEjecucion)break;
  }
  if(!added)break;
}
return result;
