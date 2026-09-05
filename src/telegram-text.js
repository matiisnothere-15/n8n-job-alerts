const j=$('¿Es buen match?').item.json;
const c=$('Configuración').first().json;
// Recortar antes de escapar evita entidades HTML incompletas.
const clean=(value,max)=>String(value||'').slice(0,max).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const status=withPdf?'CV adjunto: revisa el contenido antes de postular.':c.generarPdf?'No se pudo generar el PDF. Revisa el nodo de compilación.':'Alerta sin PDF (opción desactivada).';
return ['Oferta compatible: '+j.score+'/100',clean(j.titulo,120),clean(j.empresa,100),clean(j.ubicacion,80),status,
  'Brechas: '+clean(j.requisitos_faltantes,180),clean(j.url,160)].join('\n');
