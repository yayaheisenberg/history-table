const table = document.querySelector(".table");
let allBooks = [];

// 1. On crée UNE SEULE hover card pour toute la page
const hCard = document.createElement("div");
hCard.className = "hover-card";
hCard.style.display = "none";
document.body.appendChild(hCard);

fetch("data/books.json")
  .then(res => res.json())
  .then(data => {
    allBooks = data;
    renderTable(allBooks);
  });

function getThemeColor(theme) {
  const colors = { holocaust: "#f39c12", nazisme: "#ff2d2d", coldwar: "#3498db" };
  return colors[theme] || "#1e6b73";
}

function renderTable(booksToDisplay) {
  table.innerHTML = "";
  const totalSlots = 90;

  for (let i = 0; i < totalSlots; i++) {
    const book = booksToDisplay[i];
    if (book) {
      const cell = document.createElement("div");
      const themeColor = getThemeColor(book.theme);
      cell.className = `cell ${book.theme}`;
      cell.style.color = themeColor;
      cell.innerHTML = `
        <div class="number">${book.number}</div>
        <div class="code">${book.code}</div>
        <div class="title">${book.title}</div>
      `;

      cell.addEventListener("mouseenter", () => {
        const starsHTML = "★".repeat(book.rating) + "☆".repeat(5 - book.rating);
        hCard.innerHTML = `
          <div class="hover-header">
            <div class="hover-rating-section">
              <div class="hover-score" style="color: #ffcc00;">${book.rating}.0</div>
              <div class="hover-rating-label">MY RATING:</div>
              <div class="hover-stars" style="color: #ffcc00;">${starsHTML}</div>
            </div>
            <div class="hover-image-container">
              <img src="${book.image}" alt="Couverture">
            </div>
          </div>
          <div class="hover-body">
            <div class="hover-description-box">${book.description || "Aucun résumé disponible."}</div>
            <h3 class="hover-book-title">${book.title}</h3>
            <div class="hover-footer-row">
              <p class="hover-author">By ${book.author || 'Unknown'}</p>
              <span class="hover-badge" style="background-color: ${themeColor}">${book.theme}</span>
            </div>
          </div>
        `;
        hCard.style.display = "flex";
      });

      cell.addEventListener("mousemove", (e) => {
        // --- MISE À JOUR DES DIMENSIONS ---
        const cardWidth = 450; 
        const cardHeight = 350; // Hauteur estimée incluant le texte
        const margin = 20;
        const popOutSpace = 70; // Espace nécessaire pour l'image qui dépasse en haut

        // On positionne le haut de la carte un peu plus bas pour l'image pop-out
        let left = e.clientX + 20;
        let top = e.clientY - 40; 

        // --- SÉCURITÉ DROITE ---
        if (left + cardWidth + margin > window.innerWidth) {
            left = e.clientX - cardWidth - 20;
        }

        // --- SÉCURITÉ BAS ---
        if (top + cardHeight + margin > window.innerHeight) {
            top = window.innerHeight - cardHeight - margin;
        }

        // --- SÉCURITÉ HAUT (Crucial pour l'image qui dépasse) ---
        // On empêche le haut de la carte de monter au dessus de popOutSpace
        if (top < popOutSpace) {
            top = popOutSpace;
        }

        hCard.style.left = `${left}px`;
        hCard.style.top = `${top}px`;
        hCard.style.opacity = "1";
      });

      cell.addEventListener("mouseleave", () => {
        hCard.style.display = "none";
        hCard.style.opacity = "0";
      });

      cell.addEventListener("click", () => openModal(book, themeColor));
      table.appendChild(cell);
    } else {
      const empty = document.createElement("div");
      empty.className = "empty-cell";
      table.appendChild(empty);
    }
  }
}

function openModal(book, themeColor) {
    const modal = document.getElementById("book-modal");

    // 1. Remplissage des textes et images de base
    document.getElementById("modal-img-main").src = book.image || "";
    document.getElementById("modal-title-main").innerText = book.title;
    document.getElementById("modal-author-main").innerText = book.author || "Unknown";
    
    // --- LA LIGNE POUR LA DESCRIPTION ---
    document.getElementById("modal-description-main").innerText = book.description || "Aucune description disponible.";

    // 2. Gestion du badge (Thème)
    const badge = document.getElementById("modal-badge-main");
    badge.innerText = book.theme;
    badge.style.backgroundColor = themeColor;

    // 3. Gestion de la note et des étoiles
    document.getElementById("modal-rating-num").innerText = `${book.rating}.0`;
    const starsHTML = "★".repeat(book.rating) + "☆".repeat(5 - book.rating);
    document.getElementById("modal-stars-main").innerHTML = starsHTML;

    // 4. Données additionnelles (Pages / Année)
    // Assure-toi que ces clés existent dans ton JSON (book.pages et book.year)
    document.getElementById("modal-pages-main").innerText = book.pages || "N/A";
    document.getElementById("modal-year-main").innerText = book.year || "N/A";
  // 2. LA PARTIE YOUTUBE :
  const youtubeBtn = document.getElementById("link-youtube");

if (book.youtube) {
    youtubeBtn.href = book.youtube;
    youtubeBtn.style.display = "block"; // Affiche le bouton s'il y a un lien
} else {
    youtubeBtn.style.display = "none";  // Cache le bouton si le lien est vide
}

    // 3. On affiche la modal
    modal.classList.remove("hidden");
}
  
const modalEl = document.getElementById("book-modal");
// 1. Fermer avec le bouton X
document.getElementById("close-modal").onclick = function() {
  modalEl.classList.add("hidden");
};
// 2. Fermer en cliquant sur le fond (à côté de la carte)
window.onclick = function(event) {
  // Si la cible du clic est exactement le fond sombre (.modal) 
  // et non ses enfants (la carte .modal-content)
  if (event.target == modalEl) {
    modalEl.classList.add("hidden");
  }
};

// 3. Fermer avec la touche Échap
document.addEventListener('keydown', function(event) {
  if (event.key === "Escape" && !modalEl.classList.contains("hidden")) {
    modalEl.classList.add("hidden");
  }
});
