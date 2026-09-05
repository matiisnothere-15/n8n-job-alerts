// Sincroniza SOLO fuentes públicas y config.example.json con el flujo distribuible.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {configureWorkflow} from './workflow-lib.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.join(root,'workflow.configurable.json');
const workflow=JSON.parse(fs.readFileSync(target,'utf8'));
const config=JSON.parse(fs.readFileSync(path.join(root,'config.example.json'),'utf8'));
if (config.configuracionLista !== false || config.fuenteAutorizada !== false) throw new Error('La plantilla pública debe estar desactivada. Usa configure.mjs para el perfil privado.');
workflow.name='Job Alerts — Búsqueda de empleo para cualquier rubro';
configureWorkflow(workflow,config,root);
fs.writeFileSync(target,JSON.stringify(workflow,null,2)+'\n');
console.log('Plantilla pública sincronizada. Ejecuta node scripts/validate.mjs antes de publicarla.');
