// Los campos ya pertenecen a una sola tarjeta; nunca unir arrays por posición.
return $input.all().flatMap((entry,index)=>{
  const data=entry.json;
  if (data._sinResultados) return [];
  for (const key of ['empresa','ubicacion','fecha_publicacion']) if (data[key] == null) data[key]='';
  for (const key of ['titulo','empresa','ubicacion','fecha_publicacion','url']) {
    if (typeof data[key] !== 'string') throw new Error('Fuente: campo de tarjeta inválido: '+key);
  }
  if (!data.titulo.trim() || !data.url.trim()) throw new Error('Fuente: tarjeta incompleta.');
  const clean=v=>v.replace(/\s+/g,' ').trim();
  return [{json:{titulo:clean(data.titulo),empresa:clean(data.empresa),ubicacion:clean(data.ubicacion),
    fecha_publicacion:data.fecha_publicacion.trim(),url:data.url.replace(/&amp;/g,'&').trim(),fuente:'LinkedIn',
    keyword_origen:String(data.keyword_origen||''),categoria_origen:String(data.categoria_origen||''),
    orden_busqueda:Number(data.orden_busqueda||0)},pairedItem:{item:index}}];
});
