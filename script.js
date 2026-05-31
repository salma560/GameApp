class Game {
  constructor(id, title, thumbnail, genre, short_description) {
    this.id = id;
    this.title = title;
    this.thumbnail = thumbnail;
    this.genre = genre;
    this.short_description = short_description;
  }
}

class UI {
  static displayGames(games) {
    const section = document.getElementById("games-section");
    section.innerHTML = "";
    games.forEach((game) => {
      section.innerHTML += `
        <div class="col-md-4">
          <div class="card h-100" data-id="${game.id}">
            <img src="${game.thumbnail}" class="card-img-top" alt="${game.title}" />
            <div class="card-body">
              <h5 class="card-title">${game.title}</h5>
              <p class="card-text">${game.short_description}</p>
              <span class="badge bg-info">${game.genre}</span>
            </div>
          </div>
        </div>`;
    });
    UI.addGameListeners();
  }

  static showDetails(data) {
    document.getElementById("games-section").classList.add("d-none");
    const section = document.getElementById("details-section");
    section.classList.remove("d-none");
    section.innerHTML = `
      <img src="${data.thumbnail}" class="details-img" alt="${data.title}" />
      <h2>${data.title}</h2>
      <p>${data.description}</p>
      <p><strong>Genre:</strong> ${data.genre}</p>
      <p><strong>Platform:</strong> ${data.platform}</p>
      <a href="${data.game_url}" class="btn btn-info" target="_blank">Play Now</a>
      <br>
      <button class="btn back-btn mt-3">🔙 Back to Games</button>
    `;
    document.querySelector(".back-btn").onclick = () => {
      section.classList.add("d-none");
      document.getElementById("games-section").classList.remove("d-none");
    };
  }

  static addGameListeners() {
    document.querySelectorAll(".card").forEach((card) => {
      card.onclick = async () => {
        const id = card.getAttribute("data-id");
        const data = await fetchGameDetails(id);
        UI.showDetails(data);
      };
    });
  }
}

async function fetchGames(genre = "") {
  const res = await fetch(
    `https://free-to-play-games-database.p.rapidapi.com/api/games${
      genre ? `?category=${genre}` : ""
    }`,
    {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "69b9a2eeb9mshd5baea181bcf94ap1c23dejsn466ecb634c59",
        "X-RapidAPI-Host": "free-to-play-games-database.p.rapidapi.com",
      },
    }
  );
  const data = await res.json();
  const games = data.map(
    (g) => new Game(g.id, g.title, g.thumbnail, g.genre, g.short_description)
  );
  UI.displayGames(games);
}

async function fetchGameDetails(id) {
  const res = await fetch(
    `https://free-to-play-games-database.p.rapidapi.com/api/game?id=${id}`,
    {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "69b9a2eeb9mshd5baea181bcf94ap1c23dejsn466ecb634c59",
        "X-RapidAPI-Host": "free-to-play-games-database.p.rapidapi.com",
      },
    }
  );
  return await res.json();
}

// Event listeners
fetchGames();
document.querySelectorAll(".genre-buttons button").forEach((btn) => {
  btn.onclick = () => {
    const genre = btn.getAttribute("data-genre");
    fetchGames(genre);
  };
});
