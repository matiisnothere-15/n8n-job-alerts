const payload = $input.item.json || {};
const config = $('Configuración').first().json;
const catalogo = config.catalogoCv;
const original = $('Conservar antes de Gemini').item.json._original;
if (!original?.id_externo) throw new Error('No se pudo vincular la oferta original.');
const txt = v => String(v ?? '').trim();
const norm = v => txt(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const uniq = v => [...new Set(v)];
const perfiles = [...config.perfilesObjetivo.map(p=>p.id),'OTRO'];
const niveles = ['JUNIOR','SEMISENIOR','SENIOR','PRACTICA','TRAINEE','OTRO'];
const tipos = ['HABILIDAD','TECNOLOGIA','EXPERIENCIA','FUNCION','FORMACION','CERTIFICACION','LICENCIA','IDIOMA','UBICACION','OTRO'];
const contenido = norm(original.ubicacion + ' ' + original.descripcion);
const modalidad = /\bhibrid[oa]\b/.test(contenido) ? 'Híbrido' : /\b(remoto|remote|teletrabajo)\b/.test(contenido) ? 'Remoto' : /\b(presencial|onsite|on site)\b/.test(contenido) ? 'Presencial' : 'No especificado';
const base = {
  candidato_id: catalogo.candidato.id, fecha_deteccion: original.fecha_deteccion || new Date().toISOString(),
  id_externo: original.id_externo, titulo: txt(original.titulo), empresa: txt(original.empresa),
  ubicacion: txt(original.ubicacion), modalidad, fuente: original.fuente || 'LinkedIn',
  fecha_publicacion: txt(original.fecha_publicacion), url: txt(original.url),
  keyword_origen: (original.keywords_origen || []).join(', ') || txt(original.keyword_origen),
  categoria_seleccionada: txt(original.categoria_seleccionada || original.categoria_origen),
  descripcion: txt(original.descripcion).slice(0, config.maxDescripcionCaracteres),
  titulo_cv: catalogo.candidato.titulo, cv_latex: '', fecha_postulacion: ''
};
const errorRow = message => ({json:{...base, score:0,decision:'ERROR',perfil_cv:'NO_EVALUADO',
  justificacion: ('Análisis pendiente: ' + message).slice(0,1000), requisitos_faltantes:'No evaluados por error técnico.',
  experiencias_seleccionadas:'',proyectos_seleccionados:'',certificaciones_seleccionadas:'',
  mensaje_postulacion:'',estado:'ERROR_IA',_original:original,_seleccion:null}});
try {
  if (payload.error) throw new Error(typeof payload.error === 'string' ? payload.error : txt(payload.error.message));
  const candidate = payload.candidates?.[0];
  if (candidate?.finishReason !== 'STOP') throw new Error('Respuesta incompleta o bloqueada: ' + (candidate?.finishReason || payload.promptFeedback?.blockReason || 'sin candidato'));
  const raw = (candidate.content?.parts || []).filter(p => !p.thought && typeof p.text === 'string').map(p => p.text).join('').trim();
  const p = JSON.parse(raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));
  if (!p || Array.isArray(p) || typeof p !== 'object') throw new Error('JSON no válido.');
  if (!perfiles.includes(p.perfil_cv) || !niveles.includes(p.nivel_cargo)) throw new Error('Perfil o nivel no válido.');
  for (const key of ['acepta_junior','es_practica']) if (typeof p[key] !== 'boolean') throw new Error('Booleano inválido: ' + key);
  if (p.anos_experiencia_requeridos !== null && (typeof p.anos_experiencia_requeridos !== 'number' || !Number.isFinite(p.anos_experiencia_requeridos) || p.anos_experiencia_requeridos < 0 || p.anos_experiencia_requeridos > 20)) throw new Error('Años requeridos inválidos.');
  for (const [key,max] of [['requisitos_obligatorios',20],['requisitos_deseables',20],['funciones_similares',5],['bullets_experiencia',8],['proyectos_seleccionados',3],['habilidades_seleccionadas',16],['certificaciones_seleccionadas',4]]) {
    if (!Array.isArray(p[key]) || p[key].length > max) throw new Error('Lista inválida: ' + key);
  }
  // Referencias exactas reducen alucinaciones; no certifican la interpretación semántica.
  const skills = Object.values(catalogo.habilidades).flat();
  const evidencias = new Set([
    ...catalogo.experiencias.flatMap(e => [e.id, ...e.bullets.map(b => b.id)]),
    ...catalogo.proyectos.map(v => v.id), ...catalogo.certificaciones.map(v => v.id),
    ...skills.map(v => 'habilidad:' + v), ...catalogo.idiomas.map(v => 'idioma:' + v.idioma),
    'educacion','candidato.ubicacion','experiencia_profesional_meses'
  ]);
  for (const r of [...p.requisitos_obligatorios,...p.requisitos_deseables]) {
    if (!r || !txt(r.requisito) || typeof r.requisito !== 'string' || !tipos.includes(r.tipo) || typeof r.cumple !== 'boolean' || typeof r.evidencia_catalogo !== 'string' || typeof r.motivo !== 'string') throw new Error('Requisito mal formado.');
  }
  for (const f of p.funciones_similares) if (!f || !txt(f.funcion) || typeof f.funcion !== 'string' || typeof f.cumple !== 'boolean' || typeof f.evidencia_catalogo !== 'string') throw new Error('Función mal formada.');
  const clean = rows => rows.map(r => ({...r,cumple:r.cumple === true && evidencias.has(r.evidencia_catalogo)}));
  const oblig = clean(p.requisitos_obligatorios), dese = clean(p.requisitos_deseables);
  const funciones = uniq(clean(p.funciones_similares).filter(f=>f.cumple).map(f=>f.funcion));
  const ratio = (rows,weight,empty) => rows.length ? Math.round(weight * rows.filter(r=>r.cumple).length / rows.length) : empty;
  const meses = catalogo.experienciaProfesionalMesesAprox;
  const requeridos = p.anos_experiencia_requeridos === null ? null : p.anos_experiencia_requeridos * 12;
  // Sin mínimo explícito no se favorece un rubro o nivel de seniority particular.
  const exp = requeridos === null ? 18 : requeridos === 0 || meses >= requeridos ? 20 : Math.round(20 * meses / requeridos);
  const zona = !config.zonasPermitidas.length || config.zonasPermitidas.some(z=>norm(original.ubicacion).includes(norm(z))) || (config.aceptarRemoto && modalidad === 'Remoto');
  const partes = {obligatorios:ratio(oblig,40,24),experiencia:exp,funciones:Math.min(20,funciones.length*4),formacion:ratio(oblig.filter(r=>r.tipo==='FORMACION'),10,10),deseables:ratio(dese,5,5),ubicacion:zona?5:2};
  const bruto = Object.values(partes).reduce((a,b)=>a+b,0);
  let score = bruto;
  const topes = [];
  let bloqueado = false;
  const cap = (v,reason,hard=false) => {score=Math.min(score,v);topes.push(reason);bloqueado ||= hard;};
  if (config.excluirPracticas && (p.es_practica || p.nivel_cargo==='PRACTICA')) cap(15,'Práctica excluida',true);
  if (config.excluirSenior && ['SENIOR','SEMISENIOR'].includes(p.nivel_cargo)) cap(39,'Nivel excluido',true);
  if (requeridos !== null && meses < requeridos) cap(64,`Requiere ${requeridos} meses; el perfil acredita ${meses}`,true);
  if (oblig.some(r=>!r.cumple)) cap(39,'Requisito obligatorio sin evidencia suficiente',true);
  const perfil = p.perfil_cv;
  if (perfil === 'OTRO') cap(39,'Fuera de los perfiles objetivo configurados',true);
  if (base.descripcion.length < config.descripcionMinimaCaracteres) cap(44,'Descripción insuficiente',true);
  if (!oblig.length && funciones.length < 2) cap(59,'Pocos requisitos verificables',true);
  score = Math.max(0,Math.min(100,score));
  const decision = !bloqueado && score >= config.scoreMinimo ? 'APTO' : score >= 45 ? 'REVISAR' : 'DESCARTAR';
  const pick = (key,allowed,max) => {
    if (p[key].some(v=>typeof v !== 'string')) throw new Error('Selección mal formada: '+key);
    return uniq(p[key]).filter(v=>allowed.has(v)).slice(0,max);
  };
  const seleccion = {
    bullets_experiencia:pick('bullets_experiencia',new Set(catalogo.experiencias.flatMap(e=>e.bullets.map(b=>b.id))),8),
    proyectos_seleccionados:pick('proyectos_seleccionados',new Set(catalogo.proyectos.map(v=>v.id)),3),
    habilidades_seleccionadas:pick('habilidades_seleccionadas',new Set(skills),16),
    certificaciones_seleccionadas:pick('certificaciones_seleccionadas',new Set(catalogo.certificaciones.map(v=>v.id)),4)
  };
  const faltantes = uniq([...oblig.filter(r=>!r.cumple).map(r=>r.requisito),...dese.filter(r=>!r.cumple).map(r=>r.requisito+' (deseable)')]);
  const uso = payload.usageMetadata || {};
  return {json:{...base,score,decision,perfil_cv:perfil,
    justificacion:`Puntaje bruto ${bruto}/100; final ${score}/100. Componentes: ${JSON.stringify(partes)}. Topes: ${topes.join('; ') || 'ninguno'}. Tokens entrada ${uso.promptTokenCount||0}, salida ${uso.candidatesTokenCount||0}, total ${uso.totalTokenCount||0}.`,
    requisitos_faltantes:faltantes.join('; ') || 'Sin brechas detectadas; verificar manualmente.',
    experiencias_seleccionadas:catalogo.experiencias.filter(e=>e.bullets.some(b=>seleccion.bullets_experiencia.includes(b.id))).map(e=>e.id).join(', '),
    proyectos_seleccionados:seleccion.proyectos_seleccionados.join(', '),certificaciones_seleccionadas:seleccion.certificaciones_seleccionadas.join(', '),
    mensaje_postulacion:decision==='APTO' ? `Hola, me interesa el cargo ${base.titulo}. ${catalogo.candidato.resumen} Quedo disponible para conversar.` : '',
    estado:decision==='APTO'?'MATCH_PENDIENTE':decision==='REVISAR'?'REVISAR':'DESCARTADA',
    _seleccion:seleccion,_original:original}};
} catch (error) { return errorRow(error.message || 'Error desconocido'); }
