// El JSON entre estos marcadores se reemplaza con scripts/configure.mjs.
// CONFIG_START
const config = {};
// CONFIG_END
const fail = message => { throw new Error('Configuración: ' + message); };
if (config.configuracionLista !== true) fail('completa tu perfil y cambia configuracionLista a true.');
if (config.fuenteAutorizada !== true) fail('verifica las condiciones de la fuente antes de autorizar su uso.');
if (/REEMPLAZAR_/.test(JSON.stringify(config))) fail('quedan campos REEMPLAZAR_.');
if (!/^[a-zA-Z0-9_-]{20,}$/.test(config.googleSheetId || '')) fail('googleSheetId debe ser el ID, no el enlace completo.');
if (!String(config.googleSheetName || '').trim()) fail('falta el nombre exacto de la pestaña.');
if (!/^-?\d+$/.test(String(config.telegramChatId || ''))) fail('telegramChatId debe ser numérico.');
if (!/^[a-zA-Z0-9._-]+$/.test(config.geminiModel || '')) fail('indica el nombre de un modelo disponible, sin models/.');
for (const [key, min, max] of [['scoreMinimo',45,100],['maxOfertasPorEjecucion',1,30],['maxDetallesPorEjecucion',1,100],['descripcionMinimaCaracteres',120,2000],['maxDescripcionCaracteres',2000,30000],['geminiMaxOutputTokens',2000,16000]]) {
  if (!Number.isInteger(config[key]) || config[key] < min || config[key] > max) fail(key + ' fuera del rango ' + min + '..' + max);
}
if (config.maxDetallesPorEjecucion < config.maxOfertasPorEjecucion) fail('maxDetallesPorEjecucion debe ser mayor o igual que maxOfertasPorEjecucion.');
for (const key of ['aceptarRemoto','excluirPracticas','excluirSenior','generarPdf']) if (typeof config[key] !== 'boolean') fail(key + ' debe ser booleano.');
if (!String(config.location || '').trim()) fail('falta location.');
if (!Array.isArray(config.zonasPermitidas) || config.zonasPermitidas.some(v => typeof v !== 'string' || !v.trim())) fail('zonasPermitidas debe ser una lista de textos.');
if (!Array.isArray(config.busquedas) || !config.busquedas.length || config.busquedas.length > 12) fail('configura entre 1 y 12 búsquedas.');
if (!Array.isArray(config.perfilesObjetivo) || !config.perfilesObjetivo.length || config.perfilesObjetivo.length > 12) fail('configura entre 1 y 12 perfilesObjetivo.');
const perfiles = new Set();
for (const perfil of config.perfilesObjetivo) {
  if (!/^[a-z][a-z0-9_]*$/.test(perfil?.id || '') || perfiles.has(perfil.id) || !perfil.nombre?.trim() || !perfil.descripcion?.trim()) fail('perfil objetivo incompleto, repetido o con ID inválido.');
  perfiles.add(perfil.id);
}
for (const b of config.busquedas) if (typeof b.keyword !== 'string' || !b.keyword.trim() || !perfiles.has(b.categoria)) fail('cada búsqueda debe apuntar al ID de un perfilObjetivo.');
const c = config.catalogoCv;
if (!c?.candidato?.id || !c.candidato.nombre || !c.candidato.titulo || !c.candidato.resumen || !c.candidato.ubicacion) fail('faltan datos del candidato.');
if (!Number.isFinite(c.experienciaProfesionalMesesAprox) || c.experienciaProfesionalMesesAprox < 0) fail('meses de experiencia inválidos.');
for (const key of ['experiencias','proyectos','certificaciones','idiomas','criteriosEvidencia']) if (!Array.isArray(c[key])) fail(key + ' debe ser una lista.');
if (!c.educacion || typeof c.educacion !== 'object' || !c.habilidades || Array.isArray(c.habilidades) || typeof c.habilidades !== 'object') fail('educacion y habilidades deben ser objetos.');
if (Object.values(c.habilidades).some(v => !Array.isArray(v) || v.some(s => typeof s !== 'string' || !s.trim()))) fail('habilidades debe contener listas de textos.');
const ids = new Set();
const checkId = id => { if (!/^[a-z0-9_]+$/.test(id || '') || ids.has(id)) fail('ID vacío, repetido o inválido: ' + id); ids.add(id); };
for (const e of c.experiencias) {
  checkId(e.id);
  if (!e.cargo || !e.empresa || !e.fechas || !Array.isArray(e.bullets)) fail('experiencia incompleta.');
  for (const b of e.bullets) { checkId(b.id); if (!b.texto?.trim()) fail('bullet sin texto.'); }
}
for (const p of c.proyectos) { checkId(p.id); if (!p.nombre || !p.descripcion) fail('proyecto incompleto.'); }
for (const cert of c.certificaciones) { checkId(cert.id); if (!cert.titulo || !cert.institucion) fail('certificación incompleta.'); }
for (const idioma of c.idiomas) if (!idioma.idioma || !idioma.nivel) fail('idioma incompleto.');
if (config.generarPdf && !/^https?:\/\/[^\s]+$/.test(config.latexApiUrl || '')) fail('activa PDF solo con una API de compilación propia configurada.');
return [{ json: config }];
