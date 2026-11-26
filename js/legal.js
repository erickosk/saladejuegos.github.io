/* Datos del responsable que aparecen en el aviso de privacidad y los términos.
   >>> COMPLETA los campos vacíos antes de publicar. <<<
   (scripts/verificar.mjs avisa si siguen vacíos y la publicación automática se detiene.) */
const LEGAL = {
  responsable: 'Erick Martinez Serrano',
  correo: '',        // Ej.: 'contacto@tudominio.com'  (correo donde recibirás dudas y solicitudes de privacidad)
  domicilio: '',     // Ej.: 'Puebla, Puebla, México'  (domicilio o ciudad del responsable)
  version: '1.0',
  fecha: '25 de noviembre de 2026'
};
document.querySelectorAll('[data-legal]').forEach(el => {
  const v = LEGAL[el.dataset.legal];
  if (v) { el.textContent = v; if (el.tagName === 'A' && el.dataset.legal === 'correo') el.href = 'mailto:' + v; }
  else { el.textContent = '[pendiente de completar en js/legal.js]'; el.className += ' pendiente'; }
});
