const contenedorPaises = document.querySelector(".countries-container");
const filtroPorRegion = document.querySelector(".filter-by-region");
const inputBusqueda = document.querySelector(".search-container input");
const cambiadorTema = document.querySelector(".theme-changer");

let todosLosPaises;

fetch("https://restcountries.com/v3.1/all")
  .then((respuesta) => respuesta.json())
  .then((datos) => {
    todosLosPaises = datos;
    mostrarPaises(todosLosPaises);

    inputBusqueda.addEventListener("input", (evento) => {
      const terminoBusqueda = evento.target.value.toLowerCase();
      const paisesFiltrados = todosLosPaises.filter(pais =>
        pais.name.common.toLowerCase().includes(terminoBusqueda)
      );
      mostrarPaises(paisesFiltrados);
    });
  })
  .catch(error => {
    console.error("Error al cargar los países:", error);
    contenedorPaises.innerHTML = "<p>Hubo un error al cargar los países. Por favor, inténtalo de nuevo más tarde.</p>";
  });

filtroPorRegion.addEventListener("change", (evento) => {
  if (filtroPorRegion.value === "Filtrar por Región") {
    mostrarPaises(todosLosPaises);
  } else {
    fetch(`https://restcountries.com/v3.1/region/${filtroPorRegion.value}`)
      .then((respuesta) => respuesta.json())
      .then(mostrarPaises)
      .catch(error => {
        console.error("Error al filtrar por región:", error);
        contenedorPaises.innerHTML = "<p>Hubo un error al filtrar por región. Por favor, inténtalo de nuevo más tarde.</p>";
      });
  }
});

function mostrarPaises(datosPaises) {
  contenedorPaises.innerHTML = "";
  if (datosPaises.length === 0) {
    contenedorPaises.innerHTML = "<p>No se encontraron países con ese nombre.</p>";
    return;
  }
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

cambiadorTema.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});