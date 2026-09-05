import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {configureWorkflow} from './workflow-lib.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(process.argv[2] || path.join(root,'config.local.json'));
const config = JSON.parse(fs.readFileSync(source, 'utf8'));
const workflow = JSON.parse(fs.readFileSync(path.join(root,'workflow.configurable.json'), 'utf8'));
configureWorkflow(workflow,config,root);
const configCode = workflow.nodes.find(n=>n.name==='Configuración').parameters.jsCode;
// Solo se ejecuta el validador del proyecto. No se realizan solicitudes externas.
vm.runInNewContext('(function(){'+configCode+'})()', {}, {timeout:1000});
workflow.active=false;
const dir=path.join(root,'private');
fs.mkdirSync(dir,{recursive:true,mode:0o700});
const destination=path.join(dir,'workflow.json');
// No sobrescribe una configuración anterior accidentalmente.
fs.writeFileSync(destination,JSON.stringify(workflow,null,2)+'\n',{flag:'wx',mode:0o600});
console.log('Generado private/workflow.json. Contiene tu perfil: NO publicarlo. Importa esa copia en n8n.');
