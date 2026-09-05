const item = $input.item.json;
if (typeof item.data !== 'string') throw new Error('Fuente: la búsqueda no devolvió HTML.');
const html = item.data.trim();
// Detectar páginas de autenticación/bloqueo antes de tratar un resultado como vacío.
if (/<(?:form|iframe)\b[^>]*(?:checkpoint|authwall|login|captcha|challenge)/i.test(html) || /(?:id|class)\s*=\s*["'][^"']*(?:authwall|checkpoint|captcha|challenge-page|login__form)/i.test(html)) {
  throw new Error('Fuente: autenticación o bloqueo. Detén el flujo y revisa el acceso.');
}
// El endpoint guest puede devolver únicamente espacios cuando no quedan resultados.
const empty = !html || /class\s*=\s*["'][^"']*\b(?:jobs-search-no-results-banner|jobs-search__no-results)\b/i.test(html);
const cards = /class\s*=\s*["'][^"']*\bbase-card\b/i.test(html);
if (!empty && !cards) throw new Error('Fuente: HTML de búsqueda no reconocido; revisa los selectores.');
return {json:{...item,_busquedaVacia:empty && !cards}};
