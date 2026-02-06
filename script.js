/***********************
 * SÉLECTION DES ÉLÉMENTS
 ***********************/
const table = document.querySelector(".table");
const searchInput = document.getElementById("search");

const modal = document.getElementById("modal");
const closeBtn = document.getElementById("close");

let books = [];

/***********************
 * CHARGEMENT DES DONNÉES
 ***********************/
fetch("data/books.json")
  .then(response => response.json())
  .then(data => {
    books = data;
    renderBooks(books);
  })
  .catch(error => {
    console.error("Erreur chargement JSON :", error);
  });

/***********************
 * AFFICHAGE DES CASES
 ***********************/
function renderBooks(data) {
  table.innerHTML = "";

  data.forEach(item => {
    const cell = document.createElement("div");
    cell.className = `cell ${item.theme}`;

    cell.innerHTML = `
      <div class="number">${item.number}</div>
      <div class="code">${item.code}</div>
      <div class="title">${item.title}</div>
    `;

    cell.addEventListener("click", () => openModal(item));
    table.appendChild(cell);
  });
}

/***********************
 * MODAL
 ***********************/
function openModal(item) {
  document.getElementById("modal-title").textContent = item.title;
  document.getElementById("modal-description").textContent =
    `Thème : ${item.theme}`;
  document.getElementById("modal-theme").textContent = item.code;

  const modalImg = document.getElementById("modal-image");
  if (item.image) {
    console.log("Tentative d'affichage de :", item.image);
    modalImg.src = item.image;
    modalImg.alt = item.title;
    modalImg.style.display = "block";
  } else {
    modalImg.style.display = "none";
  }

  const ratingEl = document.getElementById("modal-rating");
ratingEl.innerHTML = "";

for (let i = 0; i < 5; i++) {
  ratingEl.innerHTML += i < item.rating ? "⭐" : "☆";
}

  modal.classList.remove("hidden");
}

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

/***********************
 * RECHERCHE
 ***********************/
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.code.toLowerCase().includes(query) ||
    book.theme.toLowerCase().includes(query)
  );

  renderBooks(filteredBooks);
});
let currentTheme = "all";
let currentRating = 0;

const themeButtons = document.querySelectorAll(".filters button");
const ratingSelect = document.getElementById("ratingFilter");

themeButtons.forEach(button => {
  button.addEventListener("click", () => {
    themeButtons.forEach(b => b.classList.remove("active"));
    button.classList.add("active");

    currentTheme = button.dataset.theme;
    applyFilters();
  });
});

ratingSelect.addEventListener("change", () => {
  currentRating = Number(ratingSelect.value);
  applyFilters();
});

function applyFilters() {
  const query = searchInput.value.toLowerCase();

  const filtered = books.filter(book => {
    const matchText =
      book.title.toLowerCase().includes(query) ||
      book.code.toLowerCase().includes(query);

    const matchTheme =
      currentTheme === "all" || book.theme === currentTheme;

    const matchRating =
      book.rating >= currentRating;

    return matchText && matchTheme && matchRating;
  });

  renderBooks(filtered);
}
