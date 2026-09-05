const rows=$input.all().map(i=>i.json || {});
const idsExistentes=[...new Set(rows.filter(r=>!/^ERROR_/i.test(String(r.estado||''))).map(r=>r.id_externo).filter(Boolean).map(String))];
// La fecha del último intento guardado da prioridad a categorías menos atendidas.
const ultimoTurnoPorCategoria=Object.create(null);
for (const row of rows) {
  const category=String(row.categoria_seleccionada||'');
  const when=Date.parse(row.fecha_deteccion)||0;
  if (category) ultimoTurnoPorCategoria[category]=Math.max(ultimoTurnoPorCategoria[category]||0,when);
}
return [{json:{idsExistentes,ultimoTurnoPorCategoria}}];
