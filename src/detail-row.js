const item=$input.item.json;
const c=$('Configuración').first().json;
if (!item.id_externo || !item._motivoDetalle) throw new Error('Descarte de detalle incompleto.');
return {json:{...item,candidato_id:c.catalogoCv.candidato.id,score:0,decision:'DESCARTAR',perfil_cv:'NO_EVALUADO',
  estado:item._motivoDetalle,justificacion:'Sin análisis IA: '+item._motivoDetalle+'. Cambia estado a ERROR_DETALLE para reintentar si el contenido fue corregido.',
  requisitos_faltantes:'No evaluados.',titulo_cv:c.catalogoCv.candidato.titulo,
  keyword_origen:(item.keywords_origen||[]).join(', ') || item.keyword_origen || '',_seleccion:null}};
