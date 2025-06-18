const contenedorPaises = document.querySelector(".countries-container");
const filtroPorRegion = document.querySelector(".filter-by-region");
const inputBusqueda = document.querySelector(".search-container input");
const cambiadorTema = document.querySelector(".theme-changer");

let todosLosPaises;

fetch("https://restcountries.com/v3.1/all")
  .then((respuesta) => respuesta.json())
  .then((datos) => {
    mostrarPaises(datos);
    todosLosPaises = datos;
  });

filtroPorRegion.addEventListener("change", (evento) => {
  fetch(`https://restcountries.com/v3.1/region/${filtroPorRegion.value}`)
    .then((respuesta) => respuesta.json())
    .then(mostrarPaises);
});

function mostrarPaises(datosPaises) {
  contenedorPaises.innerHTML = "";
  datosPaises.forEach((pais) => {
    const tarjetaPais = document.createElement("a");
    tarjetaPais.classList.add("country-card");
    tarjetaPais.href = `/API-Paises/country.html?name=${pais.name.common}`;
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
  const paisesFiltrados = todosLosPaises.filter((pais) =>
    pais.name.common.toLowerCase().includes(evento.target.value.toLowerCase())
  );
  mostrarPaises(paisesFiltrados);
});

cambiadorTema.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});