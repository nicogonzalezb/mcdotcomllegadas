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

## Cómo usar

1. Abre `index.html` en un navegador moderno (Chrome, Firefox, Safari, Edge)
2. Ingresa tu nombre en el campo correspondiente
3. Haz clic en "Iniciar Cámara" para acceder a la cámara
4. Una vez que aparezca el video, haz clic en "Tomar Foto"
5. Si quieres cambiar la foto, puedes hacer clic en "Volver a Tomar"
6. Finalmente, haz clic en "Registrar Llegada" para completar el registro

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

### Ejemplo de datos enviados:
```json
{
  "nombre": "Juan Pérez",
  "foto": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
  "timestampUTC": "2025-10-14T14:30:15.123Z",
  "timestampBogota": "2025-10-14T09:30:15.123Z",
  "fechaLegible": "14 de octubre de 2025, 09:30:15",
  "zonaHoraria": "America/Bogota"
}
```

## Implementación del backend

Actualmente, los datos se muestran en la consola del navegador. Para guardar los registros, necesitas implementar un backend que reciba los datos POST en formato JSON.

Ejemplo de endpoint:
```javascript
// En script.js, reemplaza la línea comentada:
// const response = await fetch('/api/registro', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(registroData)
// });
```

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

