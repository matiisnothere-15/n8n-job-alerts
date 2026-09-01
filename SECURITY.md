# Seguridad

No publiques tokens de Telegram, claves de Gemini, JSON de cuentas de servicio,
CV, datos personales, historiales de ejecución ni exportaciones de tu flujo privado.
No publiques capturas con credenciales o enlaces privados.

El repositorio público debe conservar el catálogo con marcadores y el flujo desactivado.
Los archivos `config.local.json` y `private/workflow.json` son privados aunque no
incluyan contraseñas: contienen el perfil profesional y los identificadores de destino.

## Reportar problemas

Describe versión de n8n, nodo, error sanitizado y pasos con datos sintéticos.
No abras un issue público que incluya secretos o una vulnerabilidad explotable.
Si el repositorio habilita private vulnerability reporting, usa ese canal;
en caso contrario solicita al mantenedor un canal privado antes de enviar detalles.

## Ante una filtración

1. Revoca y rota inmediatamente las credenciales comprometidas en cada proveedor.
2. Detén temporalmente las automatizaciones afectadas y revisa los accesos.
3. Retira datos de los archivos y limpia el historial siguiendo el procedimiento
   del proveedor Git. Borrar el archivo del último commit no borra copias antiguas.
4. Considera forks, clones, logs, capturas y cachés como posibles copias.

## Límites conocidos

El contenido de las ofertas es no confiable. Hay restricciones de dominio, reglas
contra instrucciones incrustadas, validación de tipos/referencias y protección de
fórmulas. No eliminan todos los riesgos ni errores de interpretación de un modelo.

No expongas un compilador LaTeX sin autenticación, aislamiento, límites y shell escape
desactivado. No permitas URLs de compilación suministradas por terceros.

No existe aislamiento multicliente, bloqueo entre ejecuciones ni entrega exactamente
una vez. Restringe acceso a n8n, Sheets y Telegram; conserva solo el historial necesario.
