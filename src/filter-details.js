const c=$('Configuración').first().json;
let selected=0;
return $input.all().flatMap((item,index)=>{
  // Guardar los descartes evita seleccionarlos de nuevo; no consumen el cupo IA.
  if (!item.json.detalle_valido) return [{json:{...item.json,_omitirIa:true},pairedItem:{item:index}}];
  if (selected>=c.maxOfertasPorEjecucion) return [];
  selected++;
  return [{json:{...item.json,_omitirIa:false},pairedItem:{item:index}}];
});
