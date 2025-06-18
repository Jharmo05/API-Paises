const nombrePais = new URLSearchParams(location.search).get('name');

const imagenBandera = document.querySelector('.country-details img');
const nombrePaisH1 = document.querySelector('.country-details h1');
const nombreNativo = document.querySelector('.native-name');
const poblacion = document.querySelector('.population');
const region = document.querySelector('.region');
const subRegion = document.querySelector('.sub-region');
const capital = document.querySelector('.capital');
const dominioSuperior = document.querySelector('.top-level-domain');
const monedas = document.querySelector('.currencies');
const idiomas = document.querySelector('.languages');
const paisesFronterizos = document.querySelector('.border-countries');

fetch(`https://restcountries.com/v3.1/name/${nombrePais}?fullText=true`)
  .then((respuesta) => respuesta.json())
  .then(([pais]) => {
    imagenBandera.src = pais.flags.svg || pais.flags.png;
    nombrePaisH1.innerText = pais.name.common || 'N/A';
    poblacion.innerText = pais.population?.toLocaleString() || 'N/A';
    region.innerText = pais.region || 'N/A';
    dominioSuperior.innerText = pais.tld?.join(', ') || 'N/A';
    capital.innerText = pais.capital?.[0] || 'N/A';
    subRegion.innerText = pais.subregion || 'N/A';

    if (pais.name.nativeName) {
      const nombresNativos = Object.values(pais.name.nativeName);
      if (nombresNativos.length > 0) {
        nombreNativo.innerText = nombresNativos[0].common;
      } else {
        nombreNativo.innerText = pais.name.common;
      }
    } else {
      nombreNativo.innerText = pais.name.common;
    }

    if (pais.currencies) {
      monedas.innerText = Object.values(pais.currencies)
        .map((moneda) => moneda.name)
        .join(', ');
    } else {
      monedas.innerText = 'N/A';
    }

    if (pais.languages) {
      idiomas.innerText = Object.values(pais.languages).join(', ');
    } else {
      idiomas.innerText = 'N/A';
    }

    if (pais.borders?.length) {
      paisesFronterizos.innerHTML = '<b>Países Fronterizos: </b>&nbsp;';
      pais.borders.forEach((codigoFrontera) => {
        fetch(`https://restcountries.com/v3.1/alpha/${codigoFrontera}`)
          .then((respuesta) => respuesta.json())
          .then(([paisFronterizo]) => {
            const etiquetaPaisFronterizo = document.createElement('a');
            etiquetaPaisFronterizo.innerText = paisFronterizo.name.common;
            etiquetaPaisFronterizo.href = `country.html?name=${paisFronterizo.name.common}`;
            paisesFronterizos.append(etiquetaPaisFronterizo);
          })
          .catch((error) => console.error('Error al obtener país fronterizo:', error));
      });
    } else {
      paisesFronterizos.innerText = 'Países Fronterizos: Ninguno';
    }
  })
  .catch((error) => console.error('Error al obtener los datos del país:', error));