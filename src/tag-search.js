const b = $('Buscar cada cargo').item.json;
const empty = $('Separar tarjetas').item.json._sinResultados;
const item = $input.item.json;
if (!empty && (!String(item.titulo || '').trim() || !String(item.url || '').trim())) {
  throw new Error('Fuente: tarjeta sin título o URL; revisa la estructura del HTML.');
}
return {json:{...item,_sinResultados:empty,keyword_origen:b.keyword,categoria_origen:b.categoria,orden_busqueda:b.orden}};
