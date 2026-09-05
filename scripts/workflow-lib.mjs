import fs from 'node:fs';
import path from 'node:path';
export const codeFiles={
  'Analizar respuesta IA':'analyze.js','Construir CV LaTeX':'cv.js',
  'Validar búsqueda':'search-guard.js','Separar tarjetas':'split-cards.js','Etiquetar búsqueda':'tag-search.js',
  'Unir resultados':'join-results.js','IDs existentes':'existing-ids.js','Marcar ofertas nuevas':'queue-offers.js',
  'Completar oferta':'complete-offer.js','Filtrar detalles válidos':'filter-details.js','Registrar descarte de detalle':'detail-row.js'
};
export function configureWorkflow(workflow,config,root){
  const read=name=>fs.readFileSync(path.join(root,'src',name),'utf8').replace(/\r\n/g,'\n');
  const node=name=>{const n=workflow.nodes.find(n=>n.name===name);if(!n)throw new Error('Falta el nodo '+name);return n;};
  const guard=read('config-guard.js');
  if(guard.split('const config = {};').length!==2)throw new Error('Marcador de configuración inválido.');
  node('Configuración').parameters.jsCode=guard.replace('const config = {};',()=> 'const config = '+JSON.stringify(config,null,2)+';');
  for(const [name,file] of Object.entries(codeFiles))node(name).parameters.jsCode=read(file);
  node('Evaluar con Gemini').parameters.jsonBody='={{ (() => {\n'+read('gemini-body.js')+'\n})() }}';
  for(const [name,withPdf] of [['Avisar por Telegram',true],['Avisar match sin PDF',false]]){
    const n=node(name),expression='={{ (() => {\nconst withPdf='+withPdf+';\n'+read('telegram-text.js')+'\n})() }}';
    if(withPdf)n.parameters.additionalFields.caption=expression;else n.parameters.text=expression;
    n.parameters.additionalFields.parse_mode='HTML';
    if(!withPdf)n.parameters.additionalFields.appendAttribution=false;
  }
  workflow.active=false;
  return workflow;
}
