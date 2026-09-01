import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(process.argv[2] || path.join(root,'config.local.json'));
const config = JSON.parse(fs.readFileSync(source, 'utf8'));
const workflow = JSON.parse(fs.readFileSync(path.join(root,'workflow.configurable.json'), 'utf8'));
const read = name => fs.readFileSync(path.join(root,'src',name),'utf8');
const configCode = read('config-guard.js').replace('const config = {};', 'const config = '+JSON.stringify(config,null,2)+';');
// Solo se ejecuta el validador del proyecto. No se realizan solicitudes externas.
vm.runInNewContext('(function(){'+configCode+'})()', {}, {timeout:1000});
workflow.nodes.find(n=>n.name==='Configuración').parameters.jsCode=configCode;
workflow.nodes.find(n=>n.name==='Analizar respuesta IA').parameters.jsCode=read('analyze.js');
workflow.nodes.find(n=>n.name==='Construir CV LaTeX').parameters.jsCode=read('cv.js');
workflow.nodes.find(n=>n.name==='Evaluar con Gemini').parameters.jsonBody='={{ (() => {\n'+read('gemini-body.js')+'\n})() }}';
workflow.active=false;
const dir=path.join(root,'private');
fs.mkdirSync(dir,{recursive:true,mode:0o700});
const destination=path.join(dir,'workflow.json');
// No sobrescribe una configuración anterior accidentalmente.
fs.writeFileSync(destination,JSON.stringify(workflow,null,2)+'\n',{flag:'wx',mode:0o600});
console.log('Generado private/workflow.json. Contiene tu perfil: NO publicarlo. Importa esa copia en n8n.');
