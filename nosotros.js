/* ============================================================
   EIRA - Script de la página Nosotros
   ------------------------------------------------------------
   Esta página solo necesita el modo claro/oscuro y el año.
   Usa la misma clave de localStorage que index.html ("eira-theme"),
   así el tema elegido se mantiene al pasar de una página a otra.
   ============================================================ */

const themeToggle = document.querySelector('.theme-toggle');
const root = document.documentElement;

function readTheme() {
  try {
    return localStorage.getItem('eira-theme');
  } catch (error) {
    return null;
  }
}

function applyTheme(theme) {
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
  } else {
    root.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
  }
}

applyTheme(readTheme());

themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem('eira-theme', next);
  } catch (error) {
    // Sin almacenamiento: el tema dura hasta recargar
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
