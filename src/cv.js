const item = $input.item.json;
if (item.decision !== 'APTO' || !item._seleccion) throw new Error('No hay selección válida para el CV.');
const cat = $('Configuración').first().json.catalogoCv;
const s = item._seleccion;
const esc = v => String(v ?? '').replace(/[\\{}$&#%_^~]/g, ch => ({'\\':'\\textbackslash{}','{':'\\{','}':'\\}','$':'\\$','&':'\\&','#':'\\#','%':'\\%','_':'\\_','^':'\\textasciicircum{}','~':'\\textasciitilde{}'}[ch]));
const list = lines => lines.length ? '\\begin{itemize}\n' + lines.map(t=>'\\item '+t).join('\n') + '\n\\end{itemize}\n' : '';
const section = (title,body) => body ? '\\section*{'+esc(title)+'}\n'+body+'\n' : '';
const experiencia = cat.experiencias.map(e => {
  const bullets = e.bullets.filter(b=>s.bullets_experiencia.includes(b.id));
  return bullets.length ? '\\textbf{'+esc(e.cargo)+'} — '+esc(e.empresa)+' ('+esc(e.fechas)+')\n'+list(bullets.map(b=>esc(b.texto))) : '';
}).join('\n');
const proyectos = list(cat.proyectos.filter(p=>s.proyectos_seleccionados.includes(p.id)).map(p=>'\\textbf{'+esc(p.nombre)+'}: '+esc(p.descripcion)+' '+esc(p.herramientas || p.tecnologias)));
const habilidades = list(Object.entries(cat.habilidades).map(([key,values])=> {
  const selected = values.filter(v=>s.habilidades_seleccionadas.includes(v));
  return selected.length ? '\\textbf{'+esc(key)+'}: '+selected.map(esc).join(', ') : '';
}).filter(Boolean));
const certs = list(cat.certificaciones.filter(c=>s.certificaciones_seleccionadas.includes(c.id)).map(c=>esc([c.titulo,c.institucion,c.fecha,c.nota].filter(Boolean).join(' — '))));
const c = cat.candidato;
const contacto = [c.ubicacion,c.telefono,c.email,c.linkedin,c.github].filter(Boolean).map(esc).join(' \\textbar{} ');
const educacion = Object.values(cat.educacion).filter(Boolean).map(esc).join(' — ');
const idiomas = cat.idiomas.map(i=>esc(i.idioma+': '+i.nivel)).join(', ');
const latex = '\\documentclass[10pt,a4paper]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{lmodern}\n\\usepackage[margin=1.8cm]{geometry}\n\\usepackage{parskip}\n\\pagestyle{empty}\n\\begin{document}\n'
  + '{\\LARGE\\textbf{'+esc(c.nombre)+'}}\n\n'+esc(c.titulo)+'\n\n'+contacto+'\n'
  + section('Perfil',esc(c.resumen)) + section('Experiencia',experiencia)
  + section('Proyectos',proyectos) + section('Habilidades',habilidades)
  + section('Formación complementaria',certs) + section('Educación',educacion)
  + section('Idiomas',idiomas) + '\\end{document}\n';
if (latex.length > 60000) throw new Error('CV demasiado largo: reduce el catálogo; no se truncó el documento.');
return {json:{...item,cv_latex:latex}};
