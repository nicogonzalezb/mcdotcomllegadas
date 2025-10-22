// Variables globales
let videoStream = null;
let capturedImageData = null;
let registroTipo = 'entrada';


// Reinicia la sesión cada 60 segundos sin recargar toda la página
setInterval(() => {
    stopVideoStream(); // corta el acceso a la cámara
    capturedImageData = null;
    registroForm.reset();
    photoPreview.style.display = 'none';
    submitBtn.disabled = true;
    startCameraBtn.style.display = 'inline-block';
    capturePhotoBtn.style.display = 'none';
    retakePhotoBtn.style.display = 'none';
    video.style.display = 'none';
    showMessage('Sesión reiniciada automáticamente por seguridad.', 'info');
}, 60000);

// Elementos del DOM
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startCameraBtn = document.getElementById('startCamera');
const capturePhotoBtn = document.getElementById('capturePhoto');
const retakePhotoBtn = document.getElementById('retakePhoto');
const submitBtn = document.getElementById('submitBtn');
const photoPreview = document.getElementById('photoPreview');
const capturedImage = document.getElementById('capturedImage');
const registroForm = document.getElementById('registroForm');
const messageDiv = document.getElementById('message');
const mainTitle = document.getElementById('mainTitle');
const fotoLabel = document.getElementById('fotoLabel');
const modeEntradaBtn = document.getElementById('modeEntrada');
const modeSalidaBtn = document.getElementById('modeSalida');
const WEBHOOK_URL = (window.ENV && window.ENV.WEBHOOK_URL)
    ? window.ENV.WEBHOOK_URL
    : 'https://n8ntest.nicogonzalez.xyz/webhook/c147ec91-6d71-43b6-b17a-bc3b98410f6d';

// Event listeners
startCameraBtn.addEventListener('click', startCamera);
capturePhotoBtn.addEventListener('click', capturePhoto);
retakePhotoBtn.addEventListener('click', retakePhoto);
registroForm.addEventListener('submit', submitForm);
if (modeEntradaBtn) {
    modeEntradaBtn.addEventListener('click', () => setRegistroTipo('entrada'));
}
if (modeSalidaBtn) {
    modeSalidaBtn.addEventListener('click', () => setRegistroTipo('salida'));
}

// Estado y UI del tipo de registro
function setRegistroTipo(tipo) {
    if (tipo !== 'entrada' && tipo !== 'salida') return;
    registroTipo = tipo;
    if (mainTitle) mainTitle.textContent = tipo === 'entrada' ? 'Registro de Entrada' : 'Registro de Salida';
    if (fotoLabel) fotoLabel.textContent = tipo === 'entrada' ? 'Foto de entrada:' : 'Foto de salida:';
    if (submitBtn) submitBtn.textContent = tipo === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida';
    if (modeEntradaBtn && modeSalidaBtn) {
        modeEntradaBtn.classList.toggle('active', tipo === 'entrada');
        modeEntradaBtn.setAttribute('aria-selected', String(tipo === 'entrada'));
        modeSalidaBtn.classList.toggle('active', tipo === 'salida');
        modeSalidaBtn.setAttribute('aria-selected', String(tipo === 'salida'));
    }
}
// Inicializar UI
setRegistroTipo('entrada');

// Función para iniciar la cámara
async function startCamera() {
    try {
        // Solicitar acceso a la cámara frontal si está disponible
        const constraints = {
            video: {
                facingMode: 'user', // Cámara frontal
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        // Si no hay cámara frontal, usar la trasera
        videoStream = await navigator.mediaDevices.getUserMedia(constraints)
            .catch(async () => {
                return await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment', // Cámara trasera como respaldo
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });
            });

        video.srcObject = videoStream;
        video.style.display = 'block';
        startCameraBtn.style.display = 'none';
        capturePhotoBtn.style.display = 'inline-block';

        // Ocultar mensaje de error si existe
        hideMessage();

    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        showMessage('Error al acceder a la cámara. Asegúrate de que tienes permisos y una cámara disponible.', 'error');
    }
}

// Función para capturar la foto
function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a data URL
    capturedImageData = canvas.toDataURL('image/jpeg', 0.8);

    // Mostrar la imagen capturada
    capturedImage.src = capturedImageData;
    photoPreview.style.display = 'block';

    // Ocultar video y mostrar controles de retomar
    video.style.display = 'none';
    capturePhotoBtn.style.display = 'none';
    retakePhotoBtn.style.display = 'inline-block';

    // Habilitar el botón de envío
    submitBtn.disabled = false;

    // Detener el stream de video
    stopVideoStream();
}

// Función para volver a tomar la foto
function retakePhoto() {
    // Ocultar preview de foto
    photoPreview.style.display = 'none';
    capturedImageData = null;

    // Mostrar video nuevamente
    video.style.display = 'block';
    retakePhotoBtn.style.display = 'none';
    capturePhotoBtn.style.display = 'inline-block';

    // Deshabilitar botón de envío
    submitBtn.disabled = true;

    // Reiniciar la cámara
    startCamera();
}

// Función para detener el stream de video
function stopVideoStream() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

// Función para obtener la fecha y hora actual en Bogotá
function getBogotaTime() {
    const now = new Date();

    // Obtener fecha y hora en zona horaria de Bogotá
    const bogotaTime = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(now);

    // Crear fecha legible para mostrar al usuario
    const fechaLegible = new Intl.DateTimeFormat('es-ES', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(now);

    // Crear timestamp en formato ISO pero con la hora de Bogotá
    const [datePart, timePart] = bogotaTime.split(', ');
    const [day, month, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');
    const bogotaDate = new Date(year, month - 1, day, hour, minute, second);

    return {
        timestampUTC: now.toISOString(),
        timestampBogota: bogotaDate.toISOString(),
        fechaLegible: fechaLegible,
        zonaHoraria: 'America/Bogota'
    };
}

// Función para enviar el formulario
async function submitForm(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const cedula = document.getElementById('cedula') ? document.getElementById('cedula').value.trim() : '';

    if (!nombre) {
        showMessage('Por favor, ingresa tu nombre.', 'error');
        return;
    }

    if (!capturedImageData) {
        showMessage('Por favor, toma una foto antes de enviar.', 'error');
        return;
    }

    if (!cedula) {
        showMessage('Por favor, ingresa tu cédula.', 'error');
        return;
    }

    // Obtener timestamp y datos para UI
    const tiempoBogota = getBogotaTime();
    const payload = {
        tipo: registroTipo,
        nombre: nombre,
        cedula: cedula,
        timestamp: new Date().toISOString(),
        timestampBogota: tiempoBogota.timestampBogota,
        fechaLegible: tiempoBogota.fechaLegible,
        zonaHoraria: tiempoBogota.zonaHoraria,
        fotoBase64: capturedImageData,
        userAgent: navigator.userAgent
    };

    try {
        if (!WEBHOOK_URL) {
            showMessage('Configuración inválida: falta ENV.WEBHOOK_URL', 'error');
            return;
        }

        if (WEBHOOK_URL === 'MODO_PRUEBA_LOCAL') {
            // Simular éxito local sin enviar
            await new Promise(resolve => setTimeout(resolve, 500));
        } else {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const responseText = await response.text().catch(() => '');
                throw new Error(`Webhook respondió ${response.status} ${response.statusText}. ${responseText}`);
            }
        }

        // Mostrar mensaje de éxito
        const saludo = registroTipo === 'entrada' ? '¡Registro de entrada exitoso!' : '¡Registro de salida exitoso!';
        showMessage(`${saludo} ${nombre}. Hora: ${tiempoBogota.fechaLegible}`, 'success');

        // Limpiar formulario
        registroForm.reset();
        photoPreview.style.display = 'none';
        capturedImageData = null;
        submitBtn.disabled = true;
        startCameraBtn.style.display = 'inline-block';
        capturePhotoBtn.style.display = 'none';
        retakePhotoBtn.style.display = 'none';
        video.style.display = 'none';

        // Detener cualquier stream activo
        stopVideoStream();

    } catch (error) {
        console.error('Error al enviar el registro:', error);
        showMessage(`Error al enviar el registro: ${error.message}`,'error');
    }
}

// Función para mostrar mensajes
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // Ocultar automáticamente después de 5 segundos para mensajes de éxito
    if (type === 'success') {
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

// Función para ocultar mensajes
function hideMessage() {
    messageDiv.style.display = 'none';
}

// Función para manejar errores de la cámara
function handleCameraError(error) {
    console.error('Error de cámara:', error);
    let message = 'Error al acceder a la cámara. ';

    switch (error.name) {
        case 'NotAllowedError':
            message += 'Debes permitir el acceso a la cámara.';
            break;
        case 'NotFoundError':
            message += 'No se encontró ninguna cámara.';
            break;
        case 'NotSupportedError':
            message += 'Tu navegador no soporta acceso a la cámara.';
            break;
        default:
            message += 'Verifica que tienes permisos y una cámara disponible.';
    }

    showMessage(message, 'error');
}

// Verificar soporte de la API de MediaDevices
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showMessage('Tu navegador no soporta acceso a la cámara. Actualiza tu navegador.', 'error');
    startCameraBtn.disabled = true;
}

// Cleanup al cerrar la página
window.addEventListener('beforeunload', () => {
    stopVideoStream();
});

