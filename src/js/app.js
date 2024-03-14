let searchBtn = document.getElementById("search-btn");
let input = document.getElementById("search-movie");
const apikey = "700ef8db2ca4abdb7094218bdf8562f3";
const searchResult = document.getElementById("results");
searchBtn.addEventListener("click", searchTMDB);

//För att via input söka efter film - dessa bör visas som alternativ för användaren
async function searchTMDB() {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${input.value}&api_key=${apikey}`
  );
  const TMDBresult = await response.json();
  console.log(TMDBresult);

  searchResult.innerHTML = "";

  TMDBresult.results.forEach((movie) => {
    const listItemEl = document.createElement("li");
    const thumbnailEl = document.createElement("img");
    thumbnailEl.src = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
    thumbnailEl.alt = `${movie.title} Poster`;
    listItemEl.innerHTML = movie.title;
    listItemEl.addEventListener("click", () => {
      searchTMDBid(movie.id);
    });
    searchResult.appendChild(listItemEl);
    if (movie.poster_path !== null) {
      searchResult.appendChild(thumbnailEl);
    }
  });
}
const movieTitleEl = document.createElement("h2");
//Det alternativ som använder väljer ska sedan sökas efter igen men med id
async function searchTMDBid(id) {
  searchResult.innerHTML = "";
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${apikey}`
  );
  const movie = await response.json();
  console.log(movie);

  const moviePosterEl = document.createElement("img");
  const movieAboutEl = document.createElement("p");

  moviePosterEl.src = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
  moviePosterEl.alt = `${movie.title} Poster`;
  movieTitleEl.innerHTML = movie.title;
  movieAboutEl.innerHTML = movie.overview;

  if (movie.poster_path !== null) {
    searchResult.appendChild(moviePosterEl);
  }
  searchResult.appendChild(movieTitleEl);
  searchResult.appendChild(movieAboutEl);

  actorsOmdb(movie.imdb_id);
  providersTMBD(movie.imdb_id);
}

//Sedan plocka imdb-id från den och använda till OMDB-API för att visa något speciellt - men vad?
async function actorsOmdb(id) {
  try {
    const response = await fetch(
      `http://www.omdbapi.com/?apikey=b835914f&i=${id}`
    );
    const movieResult = await response.json();
    console.log(movieResult);

    const infoSec = document.createElement("section");
    const infoH4 = document.createElement("h4");
    const runtimeEl = document.createElement("p");
    const genreEl = document.createElement("p");
    const actorEl = document.createElement("p");
    const rateEl = document.createElement("p");

    movieTitleEl.innerHTML += `, ${movieResult.Year}`;
    infoH4.innerHTML = `Mer om ${movieResult.Title}`;
    runtimeEl.innerHTML = `Speltid: ${movieResult.Runtime}`;
    genreEl.innerHTML = `Genre: ${movieResult.Genre}`;
    actorEl.innerHTML = `Skådespelare: ${movieResult.Actors}`;
    rateEl.innerHTML = `Åldersgräns: ${movieResult.Rated}`;
    infoSec.appendChild(infoH4);
    infoSec.appendChild(runtimeEl);
    infoSec.appendChild(genreEl);
    infoSec.appendChild(actorEl);
    infoSec.appendChild(rateEl);
    searchResult.appendChild(infoSec);
  } catch (error) {
    console.log("Något gick fel!");
  }
}
//Använder id för att visa vilka som erbjuder filmen för köp/hyr/stream.
async function providersTMBD(id) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${apikey}`
  );
  const provider = await response.json();
  console.log(provider.results.SE.flatrate); //har här valt att bara visa svenska streamingtjänster som har filmen
  console.log(provider);
  const providerDiv = document.createElement("div");
  const providerEl = document.createElement("h4");
  providerEl.innerHTML = "Streama här";
  providerDiv.appendChild(providerEl);
  const seProviders = provider.results.SE.flatrate;
  if (seProviders) {
    seProviders.forEach((provider) => {
      const providerImgEl = document.createElement("img");

      providerImgEl.src = `https://image.tmdb.org/t/p/original${provider.logo_path}`;
      providerImgEl.title = `${provider.provider_name}`;

      providerDiv.appendChild(providerImgEl);
      searchResult.appendChild(providerDiv);
    });
  } else if (!seProviders) {
    providerEl.innerHTML =
      "Filmen finns för tillfället inte på någon svensk streamingtjänst.";
    searchResult.appendChild(providerDiv);
    providerEl.style.color = "red";
  }
}
