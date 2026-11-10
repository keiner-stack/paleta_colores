import { pedirPaletaAPI } from './api.mjs';

const botonBuscar = document.querySelector('#btn-buscar');
const inputColor = document.querySelector('#input-color');
const pickerColor = document.querySelector('#picker-color');
const contenedorPaleta = document.querySelector('#contenedor-paleta');
const textoMensaje = document.querySelector('#mensaje');
const listaHistorial = document.querySelector('#lista-historial');

// Contraste de texto WCAG según luminancia
function obtenerColorTextoAccesible(hex) {
  const colorHex = hex.replace('#', '');
  const r = parseInt(colorHex.substring(0, 2), 16);
  const g = parseInt(colorHex.substring(2, 4), 16);
  const b = parseInt(colorHex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

// Sincronización de inputs
if (pickerColor) {
  pickerColor.addEventListener('input', (e) => {
    inputColor.value = e.target.value.toUpperCase();
  });
}

if (inputColor) {
  inputColor.addEventListener('input', (e) => {
    const valor = e.target.value.trim();
    if (valor.startsWith('#') && valor.length === 7) {
      pickerColor.value = valor;
    }
  });
}

// Historial en localStorage con Badges de Bootstrap
function guardarEnHistorial(color) {
  let historial = JSON.parse(localStorage.getItem('historialPaletas')) || [];
  if (!historial.includes(color)) { // ¿NO esta el color en el historial?
    historial.unshift(color);
    historial = historial.slice(0, 5); // Se toman los ultimos 5 
    localStorage.setItem('historialPaletas', JSON.stringify(historial));
  }
  mostrarHistorial();
}

function mostrarHistorial() {
  if (!listaHistorial) return;
  listaHistorial.textContent = '';
  const historial = JSON.parse(localStorage.getItem('historialPaletas')) || [];

  historial.forEach(colorItem => {
    const li = document.createElement('li');
    li.className = 'badge rounded-pill bg-secondary fs-6 px-3 py-2 text-wrap';
    li.style.cursor = 'pointer';
    li.textContent = colorItem;
    li.tabIndex = 0; // Accesivilidad con tab
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', `Buscar paleta para el color ${colorItem}`);

    const ejecutarBusqueda = () => {
      inputColor.value = colorItem;
      if (pickerColor && colorItem.startsWith('#')) {
        pickerColor.value = colorItem;
      }
      botonBuscar.click();
    };

    // Evento de clic con ratón
    li.addEventListener('click', ejecutarBusqueda);

    // Evento de teclado (Enter o Espacio cuando se navega con TAB)
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ejecutarBusqueda();
      }
    });

    listaHistorial.appendChild(li);
  });
}

// Renderizado dinámico aprovechando la grilla de Bootstrap
function mostrarPaletaEnPantalla(listaColores) {
  contenedorPaleta.textContent = ''; // Limpieza Anti-XSS

  for (let i = 0; i < listaColores.length; i++) {
    const hexColor = listaColores[i];

    const col = document.createElement('div');
    col.className = 'col-6 col-md-4 col-lg';

    const tarjeta = document.createElement('div');
    tarjeta.className = 'card h-100 shadow-sm border-0 d-flex align-items-center justify-content-end p-3 tarjeta-color';
    tarjeta.style.backgroundColor = hexColor;
    tarjeta.style.minHeight = '140px';
    tarjeta.style.cursor = 'pointer';

    // ACCESIBILIDAD CON TECLA TAB
    tarjeta.tabIndex = 0;
    tarjeta.setAttribute('role', 'button');
    tarjeta.setAttribute('aria-label', `Copiar código hexadecimal ${hexColor}`);

    const textoHex = document.createElement('span');
    textoHex.className = 'badge bg-white text-dark font-monospace fs-6 shadow-sm px-3 py-2';
    textoHex.textContent = hexColor;
    textoHex.style.color = obtenerColorTextoAccesible(hexColor);

    const copiarColor = async () => {
      try {
        await navigator.clipboard.writeText(hexColor);
        textoMensaje.textContent = `¡Código ${hexColor} copiado al portapapeles!`;
      } catch (err) {
        textoMensaje.textContent = `Código seleccionado: ${hexColor}`;
      }
    };

    // Evento de clic con ratón
    tarjeta.addEventListener('click', copiarColor);

    // Evento de teclado (Enter o Espacio cuando se navega con TAB)
    tarjeta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        copiarColor();
      }
    });

    tarjeta.appendChild(textoHex);
    col.appendChild(tarjeta);
    contenedorPaleta.appendChild(col);
  }
}

// Evento principal
botonBuscar.addEventListener('click', async function () {
  let colorIngresado = inputColor.value.trim();
  
  if (colorIngresado === '' && pickerColor) {
    colorIngresado = pickerColor.value.toUpperCase();
    inputColor.value = colorIngresado;
  }

  if (colorIngresado === '') {
    textoMensaje.textContent = 'Por favor ingresar un color.';
    return;
  }
  
  textoMensaje.textContent = 'Cargando paleta desde el servidor Express...';

  try {
    const listaColores = await pedirPaletaAPI(colorIngresado);
    mostrarPaletaEnPantalla(listaColores);
    guardarEnHistorial(colorIngresado);
    textoMensaje.textContent = '¡Paleta generada correctamente!';
  } catch (error) {
    console.error(error);
    textoMensaje.textContent = 'Ocurrió un error al consultar el servidor.';
  }
});

document.addEventListener('DOMContentLoaded', mostrarHistorial);