class Game {
  constructor(id, title, thumbnail, genre, short_description) {
    this.id = id;
    this.title = title;
    this.thumbnail = thumbnail;
    this.genre = genre;
    this.short_description = short_description;
  }
}

const API_HEADERS = {
  "X-RapidAPI-Key": "69b9a2eeb9mshd5baea181bcf94ap1c23dejsn466ecb634c59",
  "X-RapidAPI-Host": "free-to-play-games-database.p.rapidapi.com",
};

class UI {
  static showStatus(message, isError = false) {
    const bar = document.getElementById("status-bar");
    bar.classList.remove("d-none", "error");
    if (isError) bar.classList.add("error");
    bar.innerHTML = isError
      ? message
      : `<span class="spinner" aria-hidden="true"></span>${message}`;
  }

  static hideStatus() {
    document.getElementById("status-bar").classList.add("d-none");
  }

  static showSkeletons(count = 6) {
    const section = document.getElementById("games-section");
    section.innerHTML = Array.from({ length: count }, () => `
      <div class="col-md-4">
        <div class="skeleton-card">
          <div class="skeleton-img"></div>
          <div class="skeleton-body">
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      </div>`).join("");
  }

  static displayGames(games) {
    const section = document.getElementById("games-section");

    if (!games.length) {
      section.innerHTML = `
        <div class="col-12">
          <div class="empty-state">
            <h3>No games found</h3>
            <p>Try selecting a different genre filter.</p>
          </div>
        </div>`;
      return;
    }

    section.innerHTML = games.map((game) => `
      <div class="col-md-4">
        <article class="card h-100" data-id="${game.id}" tabindex="0" role="button" aria-label="View details for ${game.title}">
          <img src="${game.thumbnail}" class="card-img-top" alt="${game.title}" loading="lazy" />
          <div class="card-body">
            <h2 class="card-title h5">${game.title}</h2>
            <p class="card-text">${game.short_description}</p>
            <span class="tag">${game.genre}</span>
          </div>
        </article>
      </div>`).join("");

    UI.addGameListeners();
  }

  static showDetails(data) {
    document.getElementById("games-section").classList.add("d-none");
    const section = document.getElementById("details-section");
    const content = document.getElementById("details-content");
    section.classList.remove("d-none");
//hello
    content.innerHTML = `
      <div class="details-layout">
        <img src="${data.thumbnail}" class="details-img" alt="${data.title}" />
        <div>
          <h2 class="details-title">${data.title}</h2>
          <p class="details-description">${data.description}</p>
          <div class="details-meta">
            <div class="meta-item">
              <span class="meta-label">Genre</span>
              <span class="meta-value">${data.genre}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Platform</span>
              <span class="meta-value">${data.platform}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Publisher</span>
              <span class="meta-value">${data.publisher || "N/A"}</span>
            </div>
          </div>
          <a href="${data.game_url}" class="btn-play" target="_blank" rel="noopener noreferrer">
            Play Now
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
              <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
            </svg>
          </a>
        </div>
      </div>`;

    section.querySelector(".btn-back").onclick = () => {
      section.classList.add("d-none");
      document.getElementById("games-section").classList.remove("d-none");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }

  static setActiveGenre(genre) {
    document.querySelectorAll(".btn-genre").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-genre") === genre);
    });
  }

  static addGameListeners() {
    document.querySelectorAll(".card").forEach((card) => {
      const openDetails = async () => {
        const id = card.getAttribute("data-id");
        UI.showStatus("Loading game details…");
        try {
          const data = await fetchGameDetails(id);
          UI.hideStatus();
          UI.showDetails(data);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
          UI.showStatus("Failed to load game details. Please try again.", true);
        }
      };

      card.onclick = openDetails;
      card.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetails();
        }
      };
    });
  }
}

async function fetchGames(genre = "") {
  UI.showStatus("Loading games…");
  UI.showSkeletons();
  UI.setActiveGenre(genre);

  try {
    const url = `https://free-to-play-games-database.p.rapidapi.com/api/games${
      genre ? `?category=${genre}` : ""
    }`;
    const res = await fetch(url, { method: "GET", headers: API_HEADERS });

    if (!res.ok) throw new Error("Request failed");

    const data = await res.json();
    const games = data.map(
      (g) => new Game(g.id, g.title, g.thumbnail, g.genre, g.short_description)
    );
    UI.hideStatus();
    UI.displayGames(games);
  } catch {
    UI.showStatus("Unable to load games. Please check your connection and try again.", true);
    document.getElementById("games-section").innerHTML = "";
  }
}

async function fetchGameDetails(id) {
  const res = await fetch(
    `https://free-to-play-games-database.p.rapidapi.com/api/game?id=${id}`,
    { method: "GET", headers: API_HEADERS }
  );

  if (!res.ok) throw new Error("Request failed");
  return await res.json();
}

fetchGames();

document.querySelectorAll(".btn-genre").forEach((btn) => {
  btn.onclick = () => {
    const genre = btn.getAttribute("data-genre");
    document.getElementById("details-section").classList.add("d-none");
    document.getElementById("games-section").classList.remove("d-none");
    fetchGames(genre);
  };
});
