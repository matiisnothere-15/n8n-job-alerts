# Job Alerts · n8n

Plantilla de código abierto para automatizar la búsqueda de empleo en cualquier rubro. Permite definir los cargos que busca una persona, comparar las ofertas con su experiencia, formación y competencias, y recibir alertas por Telegram. Guarda los resultados en Google Sheets y permite generar un CV PDF con un compilador LaTeX externo opcional.

Administración, contabilidad, ventas, logística, educación, salud, diseño, oficios e informática son ejemplos de áreas que puedes configurar, no una lista cerrada. Los perfiles de informática usados inicialmente son solo casos de ejemplo: no definen el alcance del proyecto. La cobertura real depende de las ofertas disponibles en la fuente y de la calidad del catálogo de cada persona.

**Estado:** plantilla para pruebas y uso individual; no es un servicio listo para producción. Se distribuye desactivada, sin credenciales y sin datos de una persona real. No garantiza encontrar empleo, no postula automáticamente y no verifica por sí sola la veracidad del CV.

## ¿No sabes programar? Configúralo con ayuda de una IA

Puedes pedirle a una IA que lea tu currículum, te ayude a identificar cargos compatibles y prepare la configuración. No necesitas escribir el código desde cero, pero sí revisar el resultado y configurar personalmente las credenciales de los servicios.

### Paso 1: adjunta los archivos

Abre una herramienta de IA que permita leer archivos y adjunta:

1. Tu currículum, idealmente en PDF.
2. `workflow.configurable.json`, la plantilla pública de este proyecto.
3. `config.example.json`.
4. Este `README.md`, si puedes adjuntarlo.

Antes de compartir el CV, revisa las condiciones de privacidad de la herramienta. Puedes ocultar tu documento de identidad, dirección exacta, teléfono y otros datos innecesarios, y completarlos después en tu copia privada. No adjuntes exportaciones que contengan información sensible ni archivos de credenciales.

### Paso 2: copia este prompt

```text
Quiero configurar Job Alerts para buscar empleo según mi perfil. No soy programador: necesito instrucciones claras, paso a paso, con los nombres exactos de los archivos, nodos y campos donde debo pegar cada contenido.

Adjunto mi CV, workflow.configurable.json y config.example.json. Usa los archivos adjuntos como referencia; no inventes cómo está construido el flujo. El proyecto sirve para cualquier rubro, no solo informática.

1. ANALIZA MI CV
Lee el documento completo y extrae estudios, experiencia laboral, empresas, cargos, fechas, funciones, logros, proyectos, competencias, herramientas, certificaciones, licencias e idiomas.
No inventes información. Si no puedes leer una parte, indícalo. Pregunta por fechas o datos ambiguos antes de calcular meses de experiencia. No cuentes proyectos como empleos ni dupliques periodos superpuestos. Un curso no equivale a aprobar una certificación oficial.
Distingue hechos del CV de recomendaciones. Explica para qué cargos parece más apto mi perfil y qué brechas observas.

2. CONFIRMA MIS OBJETIVOS
Pregúntame qué cargos quiero buscar, ubicación, modalidad, si acepto prácticas y si quiero excluir puestos senior o semisenior. No asumas que todas las personas buscan puestos junior.
Si pido un filtro que el flujo no implementa, explícamelo: no agregues campos inventados esperando que funcionen.

3. PREPARA MI CONFIGURACIÓN
Respeta exactamente el esquema de config.example.json y las validaciones del nodo Configuración.
Completa catalogoCv, perfilesObjetivo y busquedas con información confirmada.
Cada categoria de busquedas debe coincidir con el id de un perfilObjetivo. Utiliza IDs válidos y únicos, tipos correctos y listas vacías cuando corresponda. Conserva la estructura admitida para educación e idiomas.
No inventes IDs de Google Sheets, chat ID, nombres de modelos ni direcciones de servicios. Si falta un valor, conserva un marcador claro y explícame cómo obtenerlo.
Mantén inicialmente configuracionLista y fuenteAutorizada en false, generarPdf en false y maxOfertasPorEjecucion en 1. Mantén el flujo desactivado. Explícame qué debo comprobar antes de cambiar esas opciones; no des por autorizada la fuente automáticamente.
No me pidas contraseñas, tokens de Telegram, claves de Gemini ni claves privadas de Google. Debo introducir esos secretos directamente en las credenciales de n8n.

4. DAME EL JSON Y LAS INSTRUCCIONES
Entrégame un resumen del perfil, los datos pendientes y el contenido completo de config.local.json, sin comentarios ni partes omitidas dentro del JSON.
Si puedes generar archivos, crea también un workflow.personalizado.json privado a partir del flujo completo adjunto. Cambia únicamente la configuración necesaria, conserva nodos, conexiones, expresiones, nombres y validaciones, y no incluyas credenciales. No reemplaces el flujo completo por un fragmento.
Si no puedes generar ese archivo, dame el código completo del nodo Configuración, incluido el validador y el retorno, e indica dónde pegarlo. No uses “...” en el contenido que debo copiar.
Explícame la diferencia: config.local.json contiene datos y NO se importa como flujo; workflow.personalizado.json contiene el flujo completo y sí se importa en n8n; el código de Configuración se pega dentro de ese nodo.

5. GUÍAME EN LA PRIMERA PRUEBA
Explícame cómo crear la hoja, colocar los encabezados, obtener los identificadores y asignar las credenciales en los nodos correctos. Después guíame en una ejecución manual con una sola oferta y dime qué resultado comprobar en cada paso.
No afirmes que una conexión funciona si no la has probado. Distingue una oferta descartada de un error técnico y explícame qué revisar antes de activar el horario.
Recuérdame que mi CV y mis archivos personalizados son privados y no deben publicarse en GitHub.
```

### Paso 3: revisa y utiliza la respuesta

Comprueba que la IA no haya inventado cargos, experiencia, estudios o habilidades. Confirma los datos pendientes antes de activar el flujo.

| Contenido recibido | Dónde utilizarlo |
| --- | --- |
| `config.local.json` | Con `scripts/configure.mjs`; no se importa directamente como flujo. |
| `workflow.personalizado.json` | Guárdalo dentro de `private/` e impórtalo como un flujo nuevo en n8n. |
| Código completo del nodo `Configuración` | Pégalo dentro del nodo Code llamado `Configuración`. |

Si recibes texto en vez de un archivo, guárdalo con un editor de texto en UTF-8 y extensión `.json`, sin copiar las líneas de apertura y cierre del bloque Markdown. En Windows comprueba que no haya quedado como `archivo.json.txt`.

No pegues el flujo completo dentro de un nodo Code. No importes `config.local.json` como si fuera el flujo. No publiques ninguna de las copias personalizadas.

El generador privado valida que la configuración esté completa; no funcionará mientras queden marcadores o las confirmaciones requeridas estén en false. Completa esas verificaciones antes de ejecutarlo. La IA ayuda a preparar los archivos, pero sus resultados no sustituyen tu revisión ni las pruebas reales.

## 1. Qué incluye

| Archivo | Para qué sirve |
| --- | --- |
| `workflow.configurable.json` | Flujo importable en n8n, con 43 nodos y valores por completar. |
| `config.example.json` | Estructura completa del perfil, búsquedas y opciones. No contiene claves. |
| `columnas.txt` | Una fila tabulada con los 26 encabezados para pegar en Sheets. |
| `scripts/configure.mjs` | Genera una copia privada del flujo a partir de tu configuración. |
| `scripts/sync.mjs` | Sincroniza las fuentes y el ejemplo público con el JSON distribuible. |
| `scripts/validate.mjs` | Pruebas locales del código, sin llamadas externas. |
| `scripts/regression.mjs`, `tests/fixtures/` | Regresiones de extracción HTML, reparto entre ciclos, límites, configuración y Telegram. |
| `scripts/workflow-lib.mjs` | Sincronización compartida de todas las fuentes en el generador público y privado. |
| `package.json`, `package-lock.json` | Dependencias de desarrollo para probar HTML con Cheerio y html-to-text; no se instalan en n8n. |
| `src/` | Código legible del validador, petición a Gemini, análisis y construcción del CV. |
| `SECURITY.md`, `.gitignore`, `LICENSE` | Seguridad, exclusión de archivos privados y licencia MIT del proyecto. |

Hay dos caminos: importar el JSON y editar el nodo **Configuración**, o completar `config.local.json` y generar el JSON privado con el script. No es necesario programar para usar el primero.

## 2. Requisitos y límites

- Una instancia de n8n donde funcionen los nodos Code de JavaScript. Los nodos incluidos son estándar; no se necesitan community nodes. Las versiones de nodo del JSON no indican la versión de la aplicación. Importa y prueba en tu instancia antes de actualizarla o activar el horario.
- Una cuenta Google, un proyecto con Google Sheets API habilitada y acceso a una hoja. Habilita también Google Drive API si utilizas operaciones de listado de archivos del conector.
- Una clave de Gemini API y un modelo disponible para tu cuenta que soporte `generateContent` y salida JSON estructurada.
- Un bot Telegram y el ID del chat destinatario.
- Opcional: una API propia que compile LaTeX a PDF. No viene incluida.

Puedes usar n8n Cloud o una instalación propia. Para instalar, sigue la [documentación oficial de n8n](https://docs.n8n.io/hosting/installation/docker/). En una instalación propia, conserva la base de datos, volúmenes y clave de cifrado de credenciales, y configura HTTPS y copias de seguridad. No expongas el editor sin autenticación.

**Fuente de ofertas:** el conector heredado utiliza un endpoint público no oficial de LinkedIn. Su disponibilidad no implica permiso de automatización; verifica sus condiciones y los permisos aplicables. Puede cambiar, devolver datos incompletos o bloquear solicitudes. Ante un bloqueo, detén el flujo; no uses mecanismos para eludirlo. Para un producto comercial, reemplázalo por una fuente autorizada. La opción `fuenteAutorizada` es una confirmación del operador, no concede autorización.

## 3. Crear Google Sheets

1. Crea un documento Google Sheets exclusivo para este candidato. No uses una hoja con datos importantes para la primera prueba.
2. Renombra la pestaña inferior como **Ofertas**. Es el nombre de la pestaña, no el título del documento.
3. Abre `columnas.txt`, copia su única línea y pégala en **A1**. Debe distribuirse hasta **Z1**. Si queda en una sola celda, usa “Dividir texto en columnas” con tabulación como separador.
4. No agregues títulos por encima, celdas combinadas, encabezados repetidos ni columnas sin nombre dentro de A:Z.
5. Copia el ID del documento: en `https://docs.google.com/spreadsheets/d/ID_DOCUMENTO/edit`, es solamente `ID_DOCUMENTO`. El número `gid` identifica una pestaña y **no** se usa como `googleSheetId`.

Encabezados exactos:

| Columna | Encabezado | Columna | Encabezado |
| --- | --- | --- | --- |
| A | candidato_id | N | score |
| B | fecha_deteccion | O | decision |
| C | id_externo | P | perfil_cv |
| D | titulo | Q | titulo_cv |
| E | empresa | R | justificacion |
| F | ubicacion | S | requisitos_faltantes |
| G | modalidad | T | experiencias_seleccionadas |
| H | fuente | U | proyectos_seleccionados |
| I | fecha_publicacion | V | certificaciones_seleccionadas |
| J | url | W | cv_latex |
| K | keyword_origen | X | mensaje_postulacion |
| L | categoria_seleccionada | Y | estado |
| M | descripcion | Z | fecha_postulacion |

### Credencial Google Service Account

1. En Google Cloud, crea una cuenta de servicio para esta integración. Si tu organización prohíbe crear claves, no eludas esa política: pide una vía aprobada o configura OAuth2 en ambos nodos de Sheets.
2. Si está permitido, genera una clave JSON. Guarda ese archivo fuera del repositorio.
3. En n8n crea una credencial **Google Service Account** y completa el correo y la clave privada con `client_email` y `private_key`. Conserva los saltos de línea de la clave.
4. En el documento de Sheets, pulsa **Compartir**, añade el correo `client_email` de la cuenta de servicio y otórgale **Editor**. No hagas pública la hoja.
5. Selecciona esa credencial en **Leer ofertas guardadas** y **Guardar en Google Sheets**.

El permiso de edición del archivo es distinto de un rol IAM del proyecto; no otorgues roles amplios para intentar corregir un 403. [Configuración oficial de cuentas de servicio en n8n](https://docs.n8n.io/integrations/builtin/credentials/google/service-account).

## 4. Configurar Telegram

1. Abre el [BotFather oficial](https://t.me/BotFather) en Telegram y utiliza `/newbot`.
2. Elige nombre y usuario; guarda el token en una credencial **Telegram API** de n8n. No lo pegues en el JSON público, capturas ni issues.
3. Abre el bot nuevo desde tu cuenta y envíale `/start`.
4. Para obtener el chat ID, puedes crear temporalmente un flujo de prueba con **Telegram Trigger**, seleccionar la misma credencial, ponerlo a escuchar y enviar otro mensaje. Copia `message.chat.id` de la salida.
5. Detén la prueba. No dejes otro trigger activo con el mismo bot si no lo necesitas; los webhooks pueden interferirse. El trigger requiere una URL HTTPS accesible desde Telegram; la salida de alertas no requiere mantener ese trigger.
6. Pon ese ID en `telegramChatId` y selecciona la credencial en **Avisar por Telegram** y **Avisar match sin PDF**.

No confundas chat ID con nombre de usuario ni token. El bot debe poder escribir en ese chat. [Guía oficial para crear bots](https://core.telegram.org/bots/tutorial).

## 5. Configurar Gemini

1. Crea una API key en [Google AI Studio](https://aistudio.google.com/apikey), con las restricciones y presupuesto que correspondan.
2. En n8n crea una credencial **Header Auth**: nombre de encabezado `x-goog-api-key`, valor tu API key.
3. En **Evaluar con Gemini** selecciona `Generic Credential Type` → `Header Auth` y esa credencial. El método es POST y el cuerpo ya está configurado como JSON.
4. En `geminiModel` introduce un modelo habilitado para tu cuenta, sin el prefijo `models/`. La plantilla no fija un nombre que pueda quedar obsoleto.
5. Mantén el cuerpo del nodo incluido; contiene catálogo, reglas de evidencia y esquema de respuesta. Primero prueba una sola oferta.

El endpoint utilizado es `https://generativelanguage.googleapis.com/v1beta/models/MODELO:generateContent`. El JSON estructurado ayuda a validar el formato, pero no garantiza que la interpretación sea correcta. Consulta [salida estructurada para generateContent](https://ai.google.dev/gemini-api/docs/generate-content/structured-output) y [referencia de la API](https://ai.google.dev/api/generate-content).

## 6. Completar tu perfil e importar

### Camino A: desde n8n, sin consola

1. Crea un flujo nuevo e importa `workflow.configurable.json` mediante **Import from File**. No sobrescribas tu flujo anterior. [Importación y exportación en n8n](https://docs.n8n.io/workflows/export-import/).
2. Abre **Configuración**. Edita solo el objeto `const config = {...};` entre los marcadores `CONFIG_START` y `CONFIG_END`; deja el validador debajo.
3. Reemplaza todos los textos `REEMPLAZAR_...`. No son datos de un CV real. Elimina de las listas los ejemplos que no correspondan, en vez de inventar información.
4. Completa los campos siguientes, asigna las tres credenciales y mantén el flujo sin activar.

### Camino B: generar una copia privada con Node.js

Requiere Node.js 22 o posterior para los scripts. Generar la configuración privada y ejecutar la validación básica no requiere instalar paquetes. La suite completa de regresión usa dependencias de desarrollo: `npm ci --ignore-scripts` y `npm test`.

1. Duplica `config.example.json` como `config.local.json` en tu equipo.
2. Edita la copia con tu perfil y configuración. No agregues claves API ni tokens: van exclusivamente en n8n.
3. Desde la carpeta del proyecto ejecuta:

```bash
node scripts/validate.mjs
node scripts/configure.mjs
```

4. Importa **private/workflow.json** en un flujo nuevo de n8n y asigna las credenciales.

El generador valida el perfil, no contacta servicios y no sobrescribe un `private/workflow.json` existente. Para regenerarlo, conserva o renombra esa copia privada primero. Nunca publiques ni el JSON generado ni `config.local.json`.

### Campos principales

| Campo | Qué colocar |
| --- | --- |
| `googleSheetId` / `googleSheetName` | ID del documento y nombre exacto de la pestaña. |
| `geminiModel` / `telegramChatId` | Modelo disponible e ID numérico del chat. |
| `location` | Ubicación enviada al buscador, por ejemplo Santiago, Chile. |
| `zonasPermitidas` | Textos de ubicación admitidos por el filtro local. `[]` no restringe ubicación en ese filtro. |
| `aceptarRemoto` | Admite resultados que indiquen remoto; no verifica restricciones migratorias o territoriales. |
| `perfilesObjetivo` | Entre 1 y 12 cargos o familias de cargos, con `id`, `nombre` y `descripcion`. Define tú las categorías; no hay un rubro obligatorio. |
| `busquedas` | Entre 1 y 12 pares `keyword` + `categoria`. Cada `categoria` debe coincidir con el `id` de un perfil objetivo. Varios términos pueden apuntar al mismo perfil. |
| `excluirPracticas` / `excluirSenior` | Por defecto `true` / `false`. Activa o desactiva según la persona; no todos buscan puestos junior. Si excluyes senior, también se filtran semisenior. |
| `scoreMinimo` | Umbral de alerta, inicialmente 65. Las restricciones obligatorias pueden impedir APTO aunque reduzcas el umbral. |
| `maxOfertasPorEjecucion` | Inicialmente 1; máximo de ofertas con detalle válido que se envían a la IA. |
| `maxDetallesPorEjecucion` | Inicialmente 10; máximo de detalles consultados antes de seleccionar los análisis. Entre 1 y 100, mayor o igual que `maxOfertasPorEjecucion`. Las búsquedas por término son adicionales. |
| `generarPdf` / `latexApiUrl` | Inicialmente `false` y vacío. Ver sección de PDF. |
| `configuracionLista` | Cambia a `true` después de revisar la configuración. |
| `fuenteAutorizada` | Cambia a `true` solo tras verificar que puedes utilizar la fuente en tu caso. |

### Cómo completar `catalogoCv`

- `candidato`: nombre, ID interno estable, título real, resumen verificado, ubicación y contactos opcionales. El título y resumen se conservan en el CV; no se inventa una especialidad profesional para cada oferta.
- `experienciaProfesionalMesesAprox`: meses reales de experiencia laboral, sin contar proyectos como empleo ni sumar dos veces periodos superpuestos.
- `experiencias`: cargo, empresa, fechas y bullets reales (funciones y logros). Cada experiencia y cada bullet necesitan un ID distinto con letras minúsculas, números y guiones bajos. Permite `[]` si no tienes experiencia laboral. `herramientas` es opcional: puede describir software, maquinaria, instrumentos o metodologías, no solo tecnología informática.
- `proyectos`: ID, nombre, descripción y herramientas opcionales. Pueden ser proyectos de cualquier disciplina. Se presentan como proyectos, no como empleos; elimina los ejemplos si no corresponden.
- `habilidades`: objeto de categorías con listas de competencias reales, por ejemplo `{"Administración": ["Gestión documental", "Atención al cliente"]}`. También admite habilidades de oficios, pedagógicas, comerciales o técnicas.
- `certificaciones`: ID, título, institución, fecha y, si corresponde, nota con vigencia o alcance. Aquí también puedes documentar licencias pertinentes. Un curso de preparación no equivale al examen oficial. Puede ser `[]`; no se valida vigencia contra registros externos.
- `educacion`, `idiomas`, `criteriosEvidencia`: estudios, niveles reales y restricciones para interpretar tu perfil.

### Ejemplo: una persona que busca administración y atención al cliente

Este fragmento sustituye solo `perfilesObjetivo` y `busquedas` dentro de la configuración; no es un archivo completo. No agregues estos cargos si no corresponden a esa persona.

```json
{
  "perfilesObjetivo": [
    {"id": "administracion", "nombre": "Asistente administrativo", "descripcion": "Gestión documental, coordinación de agenda y apoyo administrativo"},
    {"id": "atencion_cliente", "nombre": "Atención al cliente", "descripcion": "Atención de consultas, seguimiento de solicitudes y resolución de incidencias de clientes"}
  ],
  "busquedas": [
    {"keyword": "asistente administrativo", "categoria": "administracion"},
    {"keyword": "auxiliar administrativo", "categoria": "administracion"},
    {"keyword": "ejecutivo atención al cliente", "categoria": "atencion_cliente"}
  ]
}
```

Para otro rubro, cambia los cargos y sus funciones: por ejemplo `contabilidad` → asistente contable; `logistica` → operario de bodega; `educacion` → asistente de aula; `diseno` → diseñador gráfico. También puedes definir `qa`, `backend` u otros perfiles informáticos, igual que cualquier categoría. Los IDs deben comenzar con una letra minúscula y usar solo letras minúsculas, números o guiones bajos.

`perfil_cv` en la respuesta y en Sheets será el ID del perfil objetivo que corresponde a la oferta, no una categoría fija de informática. `OTRO` significa que no coincide con ningún objetivo configurado; no significa que el rubro esté prohibido. Los idiomas se evalúan desde `catalogoCv.idiomas`, sin una bandera especial para inglés.

**No se extrae un CV PDF en esta plantilla:** debes convertirlo a este catálogo y revisarlo manualmente. Tampoco hay formulario de clientes, cuenta de usuario, pagos, WhatsApp ni un chatbot conversacional. Es un bot de alertas con perfil configurado.

## 7. Revisar los nodos Google Sheets

En ambos nodos: documento **By ID** → expresión de `googleSheetId`; pestaña **By Name** → expresión de `googleSheetName`. No pegues el enlace completo ni cambies al `gid`.

En **Guardar en Google Sheets**:

- Operación: **Append or Update Row**.
- Modo: **Map Each Column Manually**. El JSON ya incluye las 26 expresiones.
- **Column to Match On**: `id_externo`.
- Su valor es `{{ $json.id_externo }}`, no el texto literal `id_externo`.
- La salida de **Preparar fila para Sheets** debe contener las 26 claves, incluido un ID no vacío.
- El formato se deja en RAW y se protegen textos con prefijos de fórmula. No cambies a evaluación de fórmulas para textos que vienen de ofertas.

La clave es únicamente `id_externo`: **una persona por hoja**. No mezcles candidatos en esta versión.

## 8. Primera prueba y activación

1. Mantén `generarPdf: false`, `maxOfertasPorEjecucion: 1`, `maxDetallesPorEjecucion: 10` y el horario sin activar.
2. Ejecuta **Probar manualmente**. Si **Configuración** falla, corrige el campo que indica; no quites el guard.
3. Comprueba que la búsqueda devuelve títulos y URLs, y que **Eliminar duplicados del lote** devuelve IDs `linkedin-...`.
4. Comprueba la lectura de Sheets. Una hoja vacía con encabezados es válida; un error de acceso no lo es.
5. Revisa **Evaluar con Gemini** y **Analizar respuesta IA**: si hay una oferta con detalle válido, debe haber un análisis válido, no `ERROR_IA`. Los descartes de detalle pasan por **Registrar descarte de detalle** sin llamar a Gemini.
6. Confirma visualmente la fila en Sheets. Una ejecución verde de otro nodo no prueba que se haya guardado.
7. Si la oferta es APTO, verifica la alerta en Telegram. REVISAR y DESCARTAR se guardan, pero no envían alerta; es normal que la primera oferta no genere mensaje. Para probar solo Telegram utiliza un nodo temporal con un mensaje de prueba, sin bajar artificialmente el score del flujo.
8. Repite manualmente y confirma que no se analiza otra vez el mismo ID ya guardado. Las filas `ERROR_IA` se pueden reintentar en ejecuciones posteriores.
9. Revisa la zona horaria del flujo: **America/Santiago**. El cron incluido es `0 */2 * * *`: cada dos horas según esa zona horaria.
10. Solo después activa/publica el flujo, según la interfaz de tu versión. El scheduler requiere que tu instancia esté funcionando. Evita ejecuciones simultáneas: esta plantilla no incluye un bloqueo de concurrencia.

Si no existen ofertas nuevas o ninguna supera los filtros, una rama puede terminar sin datos. Eso no es por sí mismo un fallo. No actives “Always Output Data” en todos los filtros: podrías enviar ítems vacíos a servicios externos.

## 9. PDF opcional

Las alertas funcionan sin PDF. Para activarlo necesitas desplegar por separado un compilador LaTeX de confianza con este contrato:

```http
POST /compile
Content-Type: application/json

{"latex":"DOCUMENTO_LATEX","filename":"CV_oferta"}
```

La respuesta exitosa debe ser el **PDF binario**, con `Content-Type: application/pdf`, no un JSON con base64 ni una URL. El nodo lo guarda en `binary.data` y Telegram lo envía como documento.

Configura `latexApiUrl` con una dirección accesible desde la instancia de n8n; `localhost` dentro de un contenedor no es necesariamente tu computador. Utiliza una red privada o HTTPS con autenticación. Si el servicio necesita credenciales, asígnalas en el nodo HTTP; no las metas en la URL. Después cambia `generarPdf` a `true`.

El compilador debe aislar cada petición, limitar tamaño/tiempo/recursos, desactivar shell escape y no exponer archivos del host. Necesita una distribución TeX con `article`, `inputenc`, `fontenc`, `lmodern`, `geometry` y `parskip`. Su implementación y despliegue no están incluidos ni probados aquí.

El CV selecciona bullets de varias experiencias, proyectos, habilidades y certificados existentes. No inventa nuevos logros. Si falla la compilación, intenta avisar por Telegram sin PDF. Revisa siempre el resultado antes de postular: la adaptación consiste en seleccionar contenido, no en garantizar un CV óptimo o un formato de una sola página.

## 10. Solución de errores frecuentes

| Error o síntoma | Qué revisar |
| --- | --- |
| `Forbidden - perhaps check your credentials?` en Sheets | Confirma cuál cuenta de servicio usa el nodo y comparte ese documento con su correo como Editor. Revisa el detalle del 403: también puede indicar API deshabilitada, restricciones de organización o credencial equivocada. No publiques la hoja como solución. |
| `Sheet with name ... not found` | El nombre debe coincidir con la pestaña inferior, incluidos espacios y mayúsculas. Verifica el documento seleccionado. |
| `Column names were updated after the node's setup` | Corrige A1:Z1 y recarga/reselecciona la hoja y los campos del nodo. Vuelve a seleccionar `id_externo` y revisa las expresiones antes de ejecutar. |
| No aparece `id_externo` | Primero resuelve permisos y nombre de pestaña; asegúrate de que C1 tenga exactamente ese texto y recarga el esquema de columnas. |
| `The 'Column to Match On' parameter is required` | Selecciona `id_externo` en el desplegable; no basta con agregarlo a Values to Send. Comprueba también su valor `{{ $json.id_externo }}`. |
| Gemini `400 INVALID_ARGUMENT` | Lee el detalle: verifica modelo, compatibilidad del esquema y cuerpo JSON. No hay una causa única demostrada para todos los 400. No reintentes en bucle la misma petición inválida. |
| Gemini `MAX_TOKENS` o JSON incompleto | Se guarda `ERROR_IA`, no APTO. Revisa límites del modelo, tamaño del catálogo y `geminiMaxOutputTokens`; considera el coste antes de aumentarlo. |
| LinkedIn 403, 429 o cambio del HTML | Detén la automatización y revisa acceso/fuente. No eludas bloqueos; considera una integración autorizada. |
| Telegram no entrega | Comprueba token, chat ID, `/start`, permisos del bot y restricciones del chat. |
| No llega PDF | Por defecto está desactivado. Si lo activaste, verifica API, accesibilidad de red, respuesta binaria y paquetes TeX. |

Referencia para errores de columnas: [problemas comunes de Google Sheets en n8n](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/common-issues). Para IA: [solución de problemas de Gemini](https://ai.google.dev/gemini-api/docs/troubleshooting).

## 11. Comportamiento del score y del registro

El código suma requisitos obligatorios (40), experiencia (20), funciones relacionadas (20), formación (10), deseables (5) y ubicación (5). Es una **heurística**, no una probabilidad de contratación. Registra puntaje bruto y puntaje final con topes.

La experiencia compara meses reales con el mínimo de la oferta, sin favorecer puestos junior cuando no hay un mínimo declarado. La IA también debe verificar que los años correspondan al rubro o función exigidos: experiencia en otro campo no acredita automáticamente el requisito. Un requisito obligatorio sin evidencia suficiente —competencia, estudio, licencia, certificación, idioma, experiencia u otro— impide APTO. Se comprueban referencias existentes del catálogo, pero una referencia existente no demuestra que la IA haya interpretado bien el requisito: revisa manualmente las ofertas importantes.

La categoría de búsqueda solo indica de dónde llegó el aviso; no certifica su perfil. La clasificación se hace con los cargos y funciones de `perfilesObjetivo`, no con una lista de carreras predeterminada. No se deben equiparar profesiones, herramientas o habilitaciones distintas. Los títulos ambiguos, requisitos territoriales, modalidad y seniority todavía pueden interpretarse mal. En empleos que exigen habilitación profesional, verifica los documentos antes de postular: la plantilla no acredita esa habilitación.

Estados del registro:

- `MATCH_PENDIENTE`: oferta compatible guardada **antes** de notificar. No significa que Telegram haya entregado el mensaje.
- `REVISAR`: compatibilidad parcial; requiere revisión.
- `DESCARTADA`: bajo score o fuera del objetivo.
- `ERROR_IA`: análisis fallido; se admite un reintento posterior.
- `DETALLE_INSUFICIENTE`: descripción demasiado corta; no se llamó a la IA.
- `PRACTICA_EXCLUIDA`: el detalle revela una práctica excluida por la configuración.
- `FUERA_DE_ZONA`: el detalle no confirma una modalidad remota admitida para una ciudad fuera de las zonas configuradas.

Los tres descartes de detalle quedan registrados y no consumen el cupo de IA ni se repiten automáticamente. Si verificaste que una oferta fue corregida, cambia solo su estado a `ERROR_DETALLE` para permitir otro intento mientras la fuente siga devolviendo ese ID. Las ofertas válidas que exceden el cupo de IA se dejan pendientes, sin marcarlas como procesadas.

El reparto da prioridad a la categoría cuyo último intento guardado en Sheets sea más antiguo, utilizando `categoria_seleccionada` y `fecha_deteccion`. Así rota entre ejecuciones incluso con un solo análisis por ciclo. No borres esas columnas si quieres conservar el reparto. Los errores de IA también cuentan como intentos; esto no añade un bloqueo de concurrencia.

Con `aceptarRemoto: true`, una ciudad fuera de zona en la tarjeta se verifica después de descargar la descripción; puede aumentar las consultas de detalle hasta el límite configurado. Una oferta presencial fuera de zona se registra como descarte. La extracción de búsqueda conserva cada tarjeta como una unidad y falla si falta su título o enlace.

Una respuesta HTML de login, bloqueo o estructura desconocida detiene la búsqueda. Se aceptan como resultados vacíos los marcadores conocidos de “sin resultados” y una respuesta del endpoint guest compuesta solo por espacios. Si la fuente cambia su contrato, se deben actualizar guard y fixtures; no se intenta eludir restricciones.

El guardado ocurre antes de construir el PDF. Por eso `cv_latex` queda vacío en Sheets en esta versión; el LaTeX, si se genera, está en la ejecución del nodo de construcción. `fecha_postulacion` se deja vacía para uso manual. No se envían postulaciones ni se registran confirmaciones de envío.

Si falla Telegram después del guardado, la siguiente ejecución omite esa oferta porque ya está en Sheets. Reintenta únicamente el envío desde una ejecución revisada o manualmente; no borres filas masivamente. La plantilla no incluye cola de entrega, idempotencia transaccional ni reintentos garantizados. El JSON no garantiza detectar todas las ofertas: busca solo la primera página por término y una ventana reciente de 24 horas.

## 12. Costes y privacidad

No se promete coste cero. Considera hosting de n8n, almacenamiento, peticiones/tokens de Gemini y el compilador opcional. Con el cron actual hay hasta 12 ejecuciones diarias; el techo de análisis sería `12 × maxOfertasPorEjecucion` por día si siempre hay suficientes ofertas nuevas. La deduplicación suele reducirlo; los errores de IA reintentados también pueden consumir recursos. Las búsquedas y detalles HTTP son adicionales.

Consulta las tarifas vigentes de tus proveedores y pon alertas de presupuesto. Usa los tokens registrados en `justificacion` para estimar consumo, sin suponer que todo token o servicio tenga el mismo precio.

El flujo envía a Gemini el historial profesional, habilidades, estudios, idiomas y la descripción de la oferta. Excluye los campos de contacto de `candidato`, **pero no anonimiza textos libres**: elimina datos sensibles que hayas escrito dentro de descripciones o bullets. Sheets conserva ofertas, resultados e ID del candidato; Telegram recibe alertas y, si se activa, el CV. La API de PDF recibe el CV completo, con los contactos configurados. n8n puede conservar estos datos en su historial: define retención y acceso adecuados.

No reutilices esta instalación como multicliente. Harían falta aislamiento por usuario, consentimiento, borrado, control de acceso, una base de datos con claves compuestas, colas y auditoría de entregas.

## 13. Publicar el proyecto en GitHub

Publica **esta plantilla pública**, no una exportación de tu instalación configurada.

1. Descomprime el paquete en una carpeta nueva. Conserva `.gitignore`; algunos exploradores ocultan archivos que empiezan por punto.
2. Lee `LICENSE` y confirma que tienes derecho a publicar el código aportado. MIT aplica a este proyecto, no cambia las licencias de n8n ni de servicios externos. Consulta la [licencia de n8n](https://docs.n8n.io/sustainable-use-license/) antes de ofrecer hosting o un producto comercial basado en él.
3. Ejecuta `node scripts/validate.mjs` y revisa manualmente que no haya datos personales, tokens, claves, archivos de cuenta de servicio ni exportaciones privadas.
4. Crea en GitHub un repositorio público vacío, por ejemplo `n8n-job-alerts`. Si sigues el método de consola, no lo inicialices con otro README o licencia.
5. Desde la carpeta descomprimida, usando Git ya configurado, ejecuta:

```bash
git init -b main
git add README.md LICENSE SECURITY.md .gitignore workflow.configurable.json config.example.json columnas.txt scripts src
git diff --cached --stat
git diff --cached
```

6. Inspecciona el contenido preparado. Solo después realiza el commit y publicación:

```bash
git commit -m "Publicar plantilla configurable de alertas de empleo"
git remote add origin https://github.com/TU_USUARIO/n8n-job-alerts.git
git push -u origin main
```

Reemplaza `TU_USUARIO` por tu usuario. Autentícate mediante GitHub CLI, el gestor de credenciales o SSH; no insertes tokens en el comando ni en la URL. Si la carpeta ya pertenece a un repositorio, no cambies su remoto sin revisar cuál es.

Como alternativa visual, usa GitHub Desktop para añadir esa carpeta, revisar los archivos del commit y publicar el repositorio. La [guía de GitHub para publicar código local](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github) explica el proceso.

`.gitignore` ayuda a excluir archivos nuevos; no elimina secretos que ya estén en el historial. Si publicaste una clave, revócala y rótala antes de limpiar el historial. Sigue `SECURITY.md`.

## 14. Validación y alcance de esta entrega

Se incluyen 55 pruebas locales: las 33 validaciones básicas de sintaxis, conexiones, configuración, deduplicación, IA, columnas y CV, más 22 regresiones. Las regresiones procesan fixtures HTML con los parsers usados por el nodo HTML, comprueban campos ausentes, login y cambios de estructura, cupos separados, turnos entre ciclos, modalidad remota, escape de Telegram, sustituciones literales y generación privada sin sobrescritura. Hay perfiles sintéticos de distintas profesiones. Las respuestas de IA son simuladas; no se mide su precisión real.

Para ejecutar toda la suite desde el proyecto:

```bash
npm ci --ignore-scripts
npm test
```

La instalación descarga dependencias del registro npm; las pruebas usan datos sintéticos y no realizan solicitudes. `node scripts/validate.mjs` sigue disponible como comprobación básica sin dependencias. GitHub Actions ejecuta la suite en Linux y Windows con Node.js 22. Se validó localmente con Node.js 24.19.0. **No sustituye una importación en n8n ni una prueba de extremo a extremo.** No se probaron las credenciales, permisos reales de Sheets, disponibilidad de LinkedIn, entrega de Telegram ni un compilador PDF. El horario se entrega desactivado.

Para modificar código, usa los archivos de `src/`; el mapa en `scripts/workflow-lib.mjs` mantiene sincronizados los nodos en el generador público y privado. Ejecuta `node scripts/sync.mjs` y después `npm test`. Sync usa exclusivamente `config.example.json`: mantén ese archivo sin datos personales. Las pruebas comprueban que la plantilla coincide con todas las fuentes. Documenta la versión de n8n en la que hagas la prueba real.

### Actualización a 1.2.0

Sustituye el paquete completo e importa el workflow de 43 nodos como un flujo nuevo. Añade `maxDetallesPorEjecucion: 10` a tu configuración privada y mantenlo mayor o igual que el límite de análisis. Se conservan las mismas 26 columnas. Asigna las credenciales, prueba manualmente y evita activar al mismo tiempo el flujo anterior y el nuevo. Las alertas usan HTML explícito y campos escapados; los caracteres Markdown de las ofertas se envían como texto.

Antes de personalizar para alguien: ejecuta las pruebas sintéticas, completa su catálogo privado, configura credenciales en n8n y haz una prueba manual con un análisis. Solo después activa el horario. El reenvío tras fallos de Telegram sigue siendo manual, como se explica en la sección 11.

### Actualización desde la plantilla inicial

La versión `1.1.0-general` reemplaza las categorías fijas de informática por `perfilesObjetivo`. Si descargaste la versión anterior, sustituye el paquete completo: cambiar solamente el README no cambia la lógica del flujo. En tu configuración privada agrega los perfiles objetivos y vincula cada búsqueda con su ID; elimina `inglesAvanzadoVerificado` y declara los niveles reales en `catalogoCv.idiomas`. Revisa `excluirSenior`, ahora desactivado por defecto. Se mantienen las mismas 26 columnas de Sheets. Importa en un flujo nuevo y deja desactivado el anterior cuando decidas pasar al nuevo, para evitar búsquedas duplicadas.
