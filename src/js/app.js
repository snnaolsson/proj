import Glide, { Breakpoints, Controls } from "@glidejs/glide";
const h2title = document.getElementById("h2title");
h2title.innerHTML = "";
let searchBtn = document.getElementById("search-btn"); //variabel för knappen från gränssnittet
let input = document.getElementById("search-movie"); //variabel för input från gränssnittet
const apikey = "700ef8db2ca4abdb7094218bdf8562f3"; //apikey
const searchResult = document.getElementById("results"); //variabel för sökresultat från html
const streamResult = document.getElementById("stream"); //variabel för streamresult från html
streamResult.innerHTML = "";
const GlideSimilar = document.getElementById("glide-similar");
const movieTitleEl = document.createElement("h2"); //skapar movietitleEl
movieTitleEl.className = "bigMovieInfo"; //lägger till klass
searchBtn.addEventListener("click", searchTMDB); //sätter händelselyssanare till knappen som kör funktionen searchtmdb vid klick
const glideUl = document.getElementById("glideUl");
//Hämtar scroll-down från gränssnittet och tilldelar till variabeln arrow. Vid klick på arrow så scrollar sidan ned till sökrutan
const arrow = document.getElementById("scroll-down");
arrow.addEventListener("click", (e) => {
  let searchPage = document.getElementById("search-sec");
  searchPage.scrollIntoView();
});

//För att via input söka efter film - dessa bör visas som alternativ för användaren
async function searchTMDB() {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${input.value}&api_key=${apikey}`
    );
    glideUl.innerHTML = ""; //Tömmer GlideUl för att inte visa similar movies när från förra sökningen i sökresultaten
    h2title.innerHTML = ""; //Tömmer h2title
    GlideSimilar.style.backgroundColor = "transparent"; //Sätter bakgrundsfärgen till transparent
    const TMDBresult = await response.json();
    streamResult.innerHTML = "";
    searchResult.innerHTML = "";

    TMDBresult.results.forEach((movie) => {
      const listItemEl = document.createElement("div"); //skapar div som ska "hålla" sökresultat
      listItemEl.className = "movieDiv"; //Lägger till klassen movieDiv
      const nameEl = document.createElement("h2"); //Skapar h2 som ska innehålla titel
      nameEl.className = "movieName"; //Lägger till klassen movieName till titel
      const thumbnailEl = document.createElement("img"); //skapar img-elementet som ska hålla i bilden till sökresultaten
      thumbnailEl.src = `https://image.tmdb.org/t/p/w200${movie.poster_path}`; //sätter src på img-elementet
      thumbnailEl.alt = `${movie.title} Poster`; //Sätter alt till bilden
      nameEl.innerHTML = movie.title; //sätter filmnamnet till h2

      listItemEl.addEventListener("click", () => {
        searchTMDBid(movie.id); //när man klickar på div så körs funktionen searchTMDBid
      });
      searchResult.appendChild(listItemEl); //lägger till listItemEl till div searchresult
      if (movie.poster_path !== null) {
        listItemEl.appendChild(thumbnailEl); //om poster_path finns så läggs bilden till i listan, annars inte.
        listItemEl.appendChild(nameEl); //kopplar namnet till diven
      } else {
        listItemEl.appendChild(nameEl); //kopplar namnet till diven
      }
    });
  } catch (error) {
    console.log("Något gick fel!");
  }
}

//Funktion som använder movie.id från tidigare sökning för att göra en sökning via ett annat call för att få fram ytterligare info
async function searchTMDBid(id) {
  try {
    searchResult.innerHTML = ""; //rensar searchresult
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${apikey}`
    );
    const movie = await response.json();
    h2title.innerHTML = "Liknande filmer";
    const moviePosterEl = document.createElement("img"); //skapar img-element
    moviePosterEl.id = "moviePoster"; //sätter id till bilden
    const movieAboutEl = document.createElement("p"); //skapar p-element för summering av film
    movieAboutEl.className = "smallMovieInfo"; //sätter klass

    moviePosterEl.src = `https://image.tmdb.org/t/p/w200${movie.poster_path}`; //sätter src till bilden
    moviePosterEl.alt = `${movie.title} Poster`; //sätter alt till bilden
    movieTitleEl.innerHTML = movie.title; //sätter filmtitel
    movieAboutEl.innerHTML = movie.overview; //lägger in info om filmen

    if (movie.poster_path !== null) {
      searchResult.appendChild(moviePosterEl); //om det finns en bild till filmen så visas den på sidan, annars inte
    }
    searchResult.appendChild(movieTitleEl); //lägger till titel till searchresult
    searchResult.appendChild(movieAboutEl); //lägger till summering om filmen till searchresult

    actorsOmdb(movie.imdb_id); //kör funktionen actorsomdb och skickar med imdb_id
    providersTMBD(movie.imdb_id); //kör funktionen providerstmdb och skickar med imdbid

    const similar = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${apikey}&language=en-US`
    );
    const similarJson = await similar.json();
    console.log(similarJson);
    const filteredMovies = similarJson.results
      .filter((similar) => {
        // Filtrera filmer med original_language som svenska, engelska eller norska
        const languages = ["sv", "en", "no"];
        return languages.includes(similar.original_language);
      })
      .sort((a, b) => b.popularity - a.popularity) // Sortera filmer efter popularitet i fallande ordning
      .slice(0, 10); // Begränsa resultatet till 10 filmer
    GlideSimilar.style.background = "#ff9a64"; //Sätter bakgrundsfärgen på GlideSimilar

    //loopar igenom listan med filtrerade filmer
    filteredMovies.forEach((filtered) => {
      const slide = document.createElement("li"); //Skapar ett nytt li-element och lägger till glide__slide som klass
      slide.classList.add("glide__slide");
      const posterImg = document.createElement("img"); //skapar ett nytt bildelement och fyller med poster_path samt sätter alt till filmtiteln
      posterImg.src = `https://image.tmdb.org/t/p/w200/${filtered.poster_path}`;
      posterImg.alt = filtered.title;
      //Koppalr ihop bilden med li-elementet och kopplar det till ul-element i DOM
      slide.appendChild(posterImg);
      glideUl.appendChild(slide);
      slide.addEventListener("click", () => {
        searchTMDBid(filtered.id); //när man klickar på div så körs funktionen searchTMDBid
      });
    });
    //Skapar ny karusell och sätter antal slides som ska synas, vart fokus ska vara samt breakpoints för hur hur många filmen den ska visa beroende på skärmstorlek
    new Glide(".glide", {
      type: "carousel",
      perView: 4,
      focusAt: "center",
      breakpoints: {
        1400: { perView: 3 },
        1000: { perView: 2 },
        767: { perView: 1 },
      },
    }).mount(); //initierar och startar karusellen med valda inställningar
  } catch (error) {
    console.log("Något gick fel!");
  }
}

//funktion som använder imdb-id som parameter och använder till OMDB-API för att visa information om info till filmen och skriver ut denna till DOM
async function actorsOmdb(id) {
  try {
    const response = await fetch(
      `http://www.omdbapi.com/?apikey=b835914f&i=${id}`
    );
    const movieResult = await response.json();

    const infoSec = document.createElement("section"); //skapar section
    infoSec.id = "movieSec"; //sätter klass
    const infoH4 = document.createElement("h4"); //skapar h4
    const runtimeEl = document.createElement("p"); //skapar p-element
    runtimeEl.className = "smallMovieInfo"; //sätter klass
    const genreEl = document.createElement("p"); //skapar p-element
    genreEl.className = "smallMovieInfo"; //sätter klass
    const actorEl = document.createElement("p"); //skapar p-element
    actorEl.className = "smallMovieInfo"; //sätter klass
    const rateEl = document.createElement("p"); //skapar p-element
    rateEl.className = "smallMovieInfo"; //sätter klass

    movieTitleEl.innerHTML += `, ${movieResult.Year}`; //lägger till årtal bredvid titeln
    infoH4.innerHTML = `Mer om ${movieResult.Title}`; //lägger rubrik till sektionen
    runtimeEl.innerHTML = `Speltid: ${movieResult.Runtime}`;
    genreEl.innerHTML = `Genre: ${movieResult.Genre}`;
    actorEl.innerHTML = `Skådespelare: ${movieResult.Actors}`;
    rateEl.innerHTML = `Åldersgräns: ${movieResult.Rated}`;
    //Kopplar ihop
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

//Använder imdb-id från annan funktion för att visa vilka som erbjuder filmen för köp/hyr/stream.
async function providersTMBD(id) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${apikey}`
    );
    const provider = await response.json();
    const seProviders = provider.results.SE.flatrate; //skapar en variabel som innehåller en array med svenska streamingtjänter som har filmen

    //om det finns svenska streamingtjänster så loopas dessa igenom
    if (seProviders) {
      seProviders.forEach((provider) => {
        streamResult.innerHTML = ""; //Raderar gamla resultat
        const providerDiv = document.createElement("div"); //skapar div
        providerDiv.id = "streamDiv"; //sätter id
        const providerEl = document.createElement("h4"); //skapar h4
        providerEl.className = "mediumMovieInfo";
        providerDiv.appendChild(providerEl); //kopplar h4 till div

        const providerImgEl = document.createElement("img"); //skapar bild för loggan
        providerImgEl.id = "logoStream";
        providerEl.innerHTML = "Streama här"; //vad som ska stå i h4 om det finns svenska streamingtjänster
        providerEl.style.color = "black"; //sätter färg
        providerImgEl.src = `https://image.tmdb.org/t/p/original${provider.logo_path}`; //src till loggan
        providerImgEl.title = `${provider.provider_name}`; //sätter namnet på streaminstjänsten så det syns man hover över bilden

        //kopplar ihop
        providerDiv.appendChild(providerImgEl);
        streamResult.appendChild(providerDiv);
      });
    } else {
      //om det inte finns svenska streamingtjänster
      streamResult.innerHTML = ""; //Raderar gamla resultat
      const providerEl = document.createElement("h4"); //skapar h4
      streamResult.appendChild(providerEl); //kopplar h4 till resultaten
      providerEl.innerHTML =
        "Filmen finns för tillfället inte på någon svensk streamingtjänst."; //vad som står i h4 om streamingtjänst inte finns
      providerEl.style.color = "red"; //sätter färgen på h4 om streamingtjönst inte finns
    }
  } catch (error) {
    console.log("Något gick fel");
  }
}
