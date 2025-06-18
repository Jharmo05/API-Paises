const contenedorPaises = document.querySelector(".countries-container");
const filtroPorRegion = document.querySelector(".filter-by-region");
const inputBusqueda = document.querySelector(".search-container input");
const cambiadorTema = document.querySelector(".theme-changer");

let todosLosPaises;
let paisesMostradosActualmente;

fetch("https://restcountries.com/v3.1/all")
  .then((respuesta) => respuesta.json())
  .then((datos) => {
    todosLosPaises = datos;
    paisesMostradosActualmente = datos;
    mostrarPaises(paisesMostradosActualmente);

    inputBusqueda.addEventListener("input", (evento) => {
      const terminoBusqueda = evento.target.value.toLowerCase();
      const paisesFiltrados = paisesMostradosActualmente.filter(pais =>
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
  const regionSeleccionada = filtroPorRegion.value;
  inputBusqueda.value = '';

  if (regionSeleccionada === "Filtrar por Región") {
    paisesMostradosActualmente = todosLosPaises;
    mostrarPaises(paisesMostradosActualmente);
  } else {
    fetch(`https://restcountries.com/v3.1/region/${regionSeleccionada}`)
      .then((respuesta) => respuesta.json())
      .then((datosRegion) => {
        paisesMostradosActualmente = datosRegion;
        mostrarPaises(paisesMostradosActualmente);
      })
      .catch(error => {
        console.error("Error al filtrar por región:", error);
        contenedorPaises.innerHTML = "<p>Hubo un error al filtrar por región. Por favor, inténtalo de nuevo más tarde.</p>";
      });
  }
});

function mostrarPaises(datosPaises) {
  contenedorPaises.innerHTML = "";
  if (datosPaises.length === 0) {
    contenedorPaises.innerHTML = "<p>No se encontraron países que coincidan con su búsqueda o filtro.</p>";
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