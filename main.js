const contenedorPaises = document.querySelector(".countries-container");
const inputBusqueda = document.querySelector(".search-container input");
const cambiadorTema = document.querySelector(".theme-changer");

let todosLosPaises;

function aplicarTemaGuardado() {
  const temaGuardado = localStorage.getItem('tema');
  if (temaGuardado === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}

aplicarTemaGuardado();

fetch("https://restcountries.com/v3.1/all")
  .then((respuesta) => respuesta.json())
  .then((datos) => {
    todosLosPaises = datos;
    mostrarPaises(datos);
  })
  .catch(error => console.error("Error al cargar todos los países:", error));

function mostrarPaises(datosPaises) {
  contenedorPaises.innerHTML = "";
  if (datosPaises.length === 0) {
    contenedorPaises.innerHTML = "<p>No se encontraron países que coincidan con la búsqueda.</p>";
    return;
  }
  datosPaises.forEach((pais) => {
    const tarjetaPais = document.createElement("a");
    tarjetaPais.classList.add("country-card");
    tarjetaPais.href = `country.html?name=${pais.name.common}`; 
    tarjetaPais.innerHTML = `
          <img src="${pais.flags.svg}" alt="Bandera de ${pais.name.common}" />
          <div class="card-text">
              <h3 class="card-title">${pais.name.common}</h3>
              <p><b>Población: </b>${pais.population.toLocaleString()}</p>
              <p><b>Región: </b>${pais.region}</p>
              <p><b>Capital: </b>${pais.capital?.[0] || 'N/A'}</p>
          </div>
  `;
    contenedorPaises.append(tarjetaPais);
  });
}

inputBusqueda.addEventListener("input", (evento) => {
  const textoBusqueda = evento.target.value.toLowerCase();
  const paisesFiltrados = todosLosPaises.filter((pais) =>
    pais.name.common.toLowerCase().includes(textoBusqueda)
  );
  mostrarPaises(paisesFiltrados);
});

cambiadorTema.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    localStorage.setItem('tema', 'dark');
  } else {
    localStorage.setItem('tema', 'light');
  }
});