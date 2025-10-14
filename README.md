# Sistema de Registro de Llegada a Oficina

Este sistema permite que las personas que llegan a la oficina se registren automáticamente capturando su nombre y una foto tomada en el momento de llegada, junto con un timestamp preciso.

## Funcionalidades

- **Registro simple**: Solo requiere ingresar el nombre
- **Captura de foto en vivo**: Abre la cámara del dispositivo para tomar una foto en el momento de llegada
- **Timestamp automático**: Registra la hora exacta del registro
- **Interfaz responsive**: Funciona en dispositivos móviles y desktop
- **Validación**: Asegura que se complete el nombre y se tome la foto antes de enviar

## Archivos

- `index.html`: Estructura HTML del formulario
- `styles.css`: Estilos CSS para la interfaz
- `script.js`: Lógica JavaScript para manejar la cámara y el envío
- `config.sample.js`: Ejemplo de configuración para definir `window.ENV.WEBHOOK_URL`

## Cómo usar

1. Abre `index.html` en un navegador moderno (Chrome, Firefox, Safari, Edge)
2. Ingresa tu nombre en el campo correspondiente
3. Haz clic en "Iniciar Cámara" para acceder a la cámara
4. Una vez que aparezca el video, haz clic en "Tomar Foto"
5. Si quieres cambiar la foto, puedes hacer clic en "Volver a Tomar"
6. Selecciona si es "Entrada" o "Salida"
7. Finalmente, haz clic en "Registrar Entrada/Salida" para completar el registro

## Configuración (webhook y variables)

Este sitio estático usa un archivo `config.js` (no versionado) para inyectar variables en `window.ENV`.

1. Copia `config.sample.js` a `config.js`.
2. Asigna tu URL real del webhook de n8n a `window.ENV.WEBHOOK_URL`.
3. Asegúrate de que `config.js` no se versiona (ya está en `.gitignore`).

Ejemplo:

```javascript
window.ENV = {
  WEBHOOK_URL: "https://tu-dominio-n8n/webhook/XXXXX"
};
```

## Datos que se registran

Cada registro incluye:
- **Nombre**: El nombre ingresado por la persona
- **Foto**: Imagen capturada en formato JPEG (como data URL)
- **Timestamp UTC**: Fecha y hora exacta del dispositivo en formato ISO 8601
- **Timestamp Bogotá**: Fecha y hora exacta en zona horaria de Bogotá (America/Bogota) en formato ISO 8601
- **Fecha legible**: Versión formateada de la fecha en hora de Bogotá para humanos
- **Zona horaria**: Indicador de que se usa 'America/Bogota'

## Zona Horaria de Bogotá

El sistema está configurado para registrar todas las horas en la zona horaria de Bogotá (America/Bogota, UTC-5), independientemente de dónde se use la aplicación. Esto asegura consistencia en los registros de llegada.

### Campos de tiempo incluidos:
- `timestampUTC`: Hora del dispositivo del usuario (para referencia)
- `timestampBogota`: Hora convertida a zona de Bogotá en formato ISO
- `fechaLegible`: Fecha y hora en formato legible en español
- `zonaHoraria`: Indicador de zona horaria usada

### Ejemplo de datos enviados al webhook:
```json
{
  "tipo": "entrada",
  "nombre": "Juan Pérez",
  "timestamp": "2025-10-14T14:30:15.123Z",
  "fotoBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
  "userAgent": "Mozilla/5.0 ..."
}
```

## Backend (n8n)

El frontend envía un POST `application/json` al webhook configurado en `WEBHOOK_URL`. En n8n, mapea los campos `tipo`, `nombre`, `timestamp` y `fotoBase64`. Si necesitas CORS, añade un nodo "Respond to Webhook" con `Access-Control-Allow-Origin: *` o configura `N8N_CORS_*`.

## Requisitos del navegador

- Navegador moderno con soporte para:
  - MediaDevices API (getUserMedia)
  - Canvas API
  - ES6+ JavaScript
- Acceso a cámara (debe permitir permisos)

## Compatibilidad

- ✅ Chrome 53+
- ✅ Firefox 49+
- ✅ Safari 11+
- ✅ Edge 79+
- ❌ Internet Explorer (no soportado)

## Personalización

Puedes modificar los estilos en `styles.css` para adaptar la apariencia a tu marca corporativa.

## Seguridad

- La foto se toma en el dispositivo del usuario
- No se almacena localmente (a menos que implementes un backend)
- Requiere permisos explícitos del usuario para acceder a la cámara

