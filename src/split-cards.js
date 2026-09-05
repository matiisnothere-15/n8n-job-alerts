const input = $input.first().json;
const cards = input.tarjetas;
const empty = $('Validar búsqueda').item.json._busquedaVacia;
if (!Array.isArray(cards)) throw new Error('Fuente: extracción de tarjetas inválida.');
if (!cards.length) {
  if (!empty) throw new Error('Fuente: había tarjetas, pero el selector no extrajo ninguna.');
  // Un centinela conserva el retorno del bucle cuando una búsqueda no tiene ofertas.
  return [{json:{data:'',_sinResultados:true},pairedItem:{item:0}}];
}
return cards.map(data=>({json:{data,_sinResultados:false},pairedItem:{item:0}}));
