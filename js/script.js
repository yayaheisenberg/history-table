const table = document.querySelector(".table");
let allBooks = [];

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

      // --- LOGIQUE HOVER (PC UNIQUEMENT) ---
      cell.addEventListener("mouseenter", () => {
        if (window.innerWidth <= 768) return; // Désactivé sur mobile

        const starsHTML = "★".repeat(book.rating) + "☆".repeat(5 - book.rating);
        hCard.innerHTML = `
          <div class="hover-header">
            <div class="hover-rating-section">
              <div class="hover-score" style="color: #ffcc00;">${book.rating}.0</div>
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
        if (window.innerWidth <= 768 || hCard.style.display === "none") return;

        const cardWidth = 450; 
        const cardHeight = 350;
        const margin = 20;
        const popOutSpace = 70;

        let left = e.clientX + 20;
        let top = e.clientY - 40; 

        if (left + cardWidth + margin > window.innerWidth) {
            left = e.clientX - cardWidth - 20;
        }

        if (top + cardHeight + margin > window.innerHeight) {
            top = window.innerHeight - cardHeight - margin;
        }

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

      // --- LOGIQUE CLIC (PC & MOBILE) ---
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
    const modalContent = modal.querySelector(".modal-content"); // On cible le contenu

    // 1. Remplissage des données
    document.getElementById("modal-img-main").src = book.image || "";
    document.getElementById("modal-title-main").innerText = book.title;
    document.getElementById("modal-author-main").innerText = book.author || "Unknown";
    document.getElementById("modal-description-main").innerText = book.description || "Aucune description disponible.";

    const badge = document.getElementById("modal-badge-main");
    badge.innerText = book.theme;
    badge.style.backgroundColor = themeColor;

    document.getElementById("modal-rating-num").innerText = `${book.rating}.0`;
    const starsHTML = "★".repeat(book.rating) + "☆".repeat(5 - book.rating);
    document.getElementById("modal-stars-main").innerHTML = starsHTML;

    document.getElementById("modal-pages-main").innerText = book.pages || "N/A";
    document.getElementById("modal-year-main").innerText = book.year || "N/A";

    const youtubeBtn = document.getElementById("link-youtube");
    if (book.youtube) {
        youtubeBtn.href = book.youtube;
        youtubeBtn.style.display = "block";
    } else {
        youtubeBtn.style.display = "none";
    }

    // --- CORRECTION MOBILE ---
    // 2. Réinitialise le scroll interne de la modal (pour ne pas commencer en bas)
    if (modalContent) modalContent.scrollTop = 0;

    // 3. Affiche la modal
    modal.classList.remove("hidden");
    
    // 4. Bloque le scroll sur TOUTE la page (body + html pour mobile)
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden'; 
}

// Fonction de fermeture centralisée pour nettoyer les styles
function closeModal() {
  const modalEl = document.getElementById("book-modal");
  modalEl.classList.add("hidden");
  
  // Réactive le scroll partout
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

// Liaison des événements de fermeture
document.getElementById("close-modal").onclick = closeModal;

window.onclick = function(event) {
  const modalEl = document.getElementById("book-modal");
  if (event.target == modalEl) closeModal();
};

document.addEventListener('keydown', function(event) {
  const modalEl = document.getElementById("book-modal");
  if (event.key === "Escape" && !modalEl.classList.contains("hidden")) {
    closeModal();
  }
});
