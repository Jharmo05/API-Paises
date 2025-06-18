const contenedorPaises = document.querySelector(".countries-container");
const filtroPorRegion = document.querySelector(".filter-by-region");
const inputBusqueda = document.querySelector(".search-container input");
const cambiadorTema = document.querySelector(".theme-changer");

let todosLosPaises = [];
let paisesMostradosActualmente = [];
let cargando = false;

const ErrorHandler = {
  mostrarError(mensaje, tipo = 'error') {
    const errorDiv = document.createElement('div');
    errorDiv.className = `error-message ${tipo}`;
    errorDiv.innerHTML = `
      <div class="error-content">
        <i class="fa-solid fa-exclamation-triangle"></i>
        <span>${mensaje}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="error-close">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    `;
    
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelector('main').insertBefore(errorDiv, document.querySelector('main').firstChild);
    
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  },

  logError(error, contexto = '') {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Error en ${contexto}:`, error);
  },

  async verificarConexion() {
    try {
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};

function normalizarTexto(texto) {
  if (!texto || typeof texto !== 'string') {
    return '';
  }
  
  try {
    return texto
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, '');
  } catch (error) {
    ErrorHandler.logError(error, 'normalizarTexto');
    return texto.toLowerCase().trim();
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function mostrarCargando(mostrar = true) {
  cargando = mostrar;
  
  if (mostrar) {
    contenedorPaises.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando países...</p>
      </div>
    `;
  }
}

function mostrarPaises(datosPaises) {
  if (cargando) return;
  
  try {
    contenedorPaises.innerHTML = "";
    
    if (!datosPaises || datosPaises.length === 0) {
      contenedorPaises.innerHTML = `
        <div class="no-results">
          <i class="fa-solid fa-search"></i>
          <p>No se encontraron países que coincidan con su búsqueda.</p>
          <button onclick="limpiarFiltros()" class="btn-clear">Limpiar filtros</button>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();
    
    datosPaises.forEach((pais) => {
      if (!pais || !pais.name || !pais.name.common) {
        ErrorHandler.logError(new Error('País con datos incompletos'), 'mostrarPaises');
        return;
      }

      const tarjetaPais = document.createElement("a");
      tarjetaPais.classList.add("country-card");
      tarjetaPais.href = `country.html?name=${encodeURIComponent(pais.name.common)}`;
      
      const bandera = pais.flags?.svg || pais.flags?.png || '';
      const poblacion = pais.population ? pais.population.toLocaleString() : 'N/A';
      const capital = pais.capital?.[0] || 'N/A';
      const region = pais.region || 'N/A';

      tarjetaPais.innerHTML = `
        <img src="${bandera}" alt="Bandera de ${pais.name.common}" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzIwMCcgaGVpZ2h0PScxMDAnIGZpbGw9JyNmMGYwZjAnLz48dGV4dCB4PSc1MCUnIHk9JzUwJScgZG9taW5hbnQtYmFzZWxpbmU9J21pZGRsZScgdGV4dC1hbmNob3I9J21pZGRsZScgZmlsbD0nIzk5OTk5OSc+U2luIGJhbmRlcmE8L3RleHQ+PC9zdmc+'" />
        <div class="card-text">
          <h3 class="card-title">${pais.name.common}</h3>
          <p><b>Población: </b>${poblacion}</p>
          <p><b>Región: </b>${region}</p>
          <p><b>Capital: </b>${capital}</p>
        </div>
      `;
      
      fragment.appendChild(tarjetaPais);
    });
    
    contenedorPaises.appendChild(fragment);
    
  } catch (error) {
    ErrorHandler.logError(error, 'mostrarPaises');
    ErrorHandler.mostrarError('Error al mostrar los países. Intenta recargar la página.');
  }
}

async function cargarPaises() {
  try {
    mostrarCargando(true);
    
    const hayConexion = await ErrorHandler.verificarConexion();
    if (!hayConexion) {
      throw new Error('Sin conexión a internet');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const respuesta = await fetch("https://restcountries.com/v3.1/all", {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });

    clearTimeout(timeoutId);

    if (!respuesta.ok) {
      throw new Error(`Error del servidor: ${respuesta.status} ${respuesta.statusText}`);
    }

    const datos = await respuesta.json();
    
    if (!Array.isArray(datos) || datos.length === 0) {
      throw new Error('No se recibieron datos válidos del servidor');
    }

    todosLosPaises = datos.sort((a, b) => {
      const nombreA = a.name?.common || '';
      const nombreB = b.name?.common || '';
      return nombreA.localeCompare(nombreB);
    });
    
    paisesMostradosActualmente = todosLosPaises;
    mostrarCargando(false);
    mostrarPaises(paisesMostradosActualmente);
    
  } catch (error) {
    mostrarCargando(false);
    ErrorHandler.logError(error, 'cargarPaises');
    
    let mensajeError = 'Error al cargar los países. ';
    
    if (error.name === 'AbortError') {
      mensajeError += 'La conexión tardó demasiado tiempo.';
    } else if (error.message.includes('Sin conexión')) {
      mensajeError += 'Verifica tu conexión a internet.';
    } else if (error.message.includes('Error del servidor')) {
      mensajeError += 'El servidor no está disponible en este momento.';
    } else {
      mensajeError += 'Intenta recargar la página.';
    }
    
    ErrorHandler.mostrarError(mensajeError);
    
    contenedorPaises.innerHTML = `
      <div class="error-container">
        <i class="fa-solid fa-exclamation-circle"></i>
        <h3>No se pudieron cargar los países</h3>
        <p>${mensajeError}</p>
        <button onclick="cargarPaises()" class="retry-btn">
          <i class="fa-solid fa-refresh"></i> Reintentar
        </button>
      </div>
    `;
  }
}

function filtrarPaises(terminoBusqueda) {
  try {
    if (!terminoBusqueda || terminoBusqueda.trim() === '') {
      return paisesMostradosActualmente;
    }

    const terminoNormalizado = normalizarTexto(terminoBusqueda);
    
    if (terminoNormalizado.length < 1) {
      return paisesMostradosActualmente;
    }

    return paisesMostradosActualmente.filter(pais => {
      if (!pais || !pais.name) return false;

      const nombreComun = normalizarTexto(pais.name.common || '');
      const nombreOficial = normalizarTexto(pais.name.official || '');
      const capital = normalizarTexto(pais.capital?.[0] || '');
      const region = normalizarTexto(pais.region || '');
      const subregion = normalizarTexto(pais.subregion || '');

      return nombreComun.includes(terminoNormalizado) ||
             nombreOficial.includes(terminoNormalizado) ||
             capital.includes(terminoNormalizado) ||
             region.includes(terminoNormalizado) ||
             subregion.includes(terminoNormalizado);
    });
    
  } catch (error) {
    ErrorHandler.logError(error, 'filtrarPaises');
    return paisesMostradosActualmente;
  }
}

function filtrarPorRegion(regionSeleccionada) {
  try {
    if (!regionSeleccionada || regionSeleccionada === "Filtrar por Región") {
      return todosLosPaises;
    }

    return todosLosPaises.filter(pais => {
      return pais && pais.region === regionSeleccionada;
    });
    
  } catch (error) {
    ErrorHandler.logError(error, 'filtrarPorRegion');
    return todosLosPaises;
  }
}

function limpiarFiltros() {
  try {
    inputBusqueda.value = '';
    filtroPorRegion.value = '';
    paisesMostradosActualmente = todosLosPaises;
    mostrarPaises(paisesMostradosActualmente);
  } catch (error) {
    ErrorHandler.logError(error, 'limpiarFiltros');
  }
}

const buscarPaisesDebounced = debounce((terminoBusqueda) => {
  try {
    const paisesFiltrados = filtrarPaises(terminoBusqueda);
    mostrarPaises(paisesFiltrados);
  } catch (error) {
    ErrorHandler.logError(error, 'buscarPaisesDebounced');
    ErrorHandler.mostrarError('Error en la búsqueda. Intenta de nuevo.');
  }
}, 300);

if (inputBusqueda) {
  inputBusqueda.addEventListener("input", (evento) => {
    try {
      const terminoBusqueda = evento.target.value;
      buscarPaisesDebounced(terminoBusqueda);
    } catch (error) {
      ErrorHandler.logError(error, 'input event listener');
    }
  });
}

if (filtroPorRegion) {
  filtroPorRegion.addEventListener("change", (evento) => {
    try {
      const regionSeleccionada = evento.target.value;
      inputBusqueda.value = '';
      
      paisesMostradosActualmente = filtrarPorRegion(regionSeleccionada);
      mostrarPaises(paisesMostradosActualmente);
    } catch (error) {
      ErrorHandler.logError(error, 'filter change event listener');
      ErrorHandler.mostrarError('Error al filtrar por región. Intenta de nuevo.');
    }
  });
}

if (cambiadorTema) {
  cambiadorTema.addEventListener("click", () => {
    try {
      document.body.classList.toggle("dark");
      localStorage.setItem('darkMode', document.body.classList.contains('dark'));
    } catch (error) {
      ErrorHandler.logError(error, 'cambiar tema');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
      document.body.classList.add('dark');
    }
  } catch (error) {
    ErrorHandler.logError(error, 'cargar tema guardado');
  }
});

window.addEventListener('online', () => {
  if (todosLosPaises.length === 0) {
    cargarPaises();
  }
});

window.addEventListener('offline', () => {
  ErrorHandler.mostrarError('Sin conexión a internet. Algunas funciones pueden no funcionar correctamente.', 'warning');
});

cargarPaises();