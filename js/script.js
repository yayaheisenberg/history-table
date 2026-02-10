const table = document.querySelector(".table");
let allBooks = [];

// 1. On crée UNE SEULE hover card pour toute la page (PC uniquement)
const hCard = document.createElement("div");
hCard.className = "hover-card";
hCard.style.display = "none";
document.body.appendChild(hCard);

// 2. Chargement des données
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
        // Bloque l'affichage si on est sur mobile
        if (window.innerWidth <= 768) return; 

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

        // Sécurité bord droit
        if (left + cardWidth + margin > window.innerWidth) {
            left = e.clientX - cardWidth - 20;
        }
        // Sécurité bord bas
        if (top + cardHeight + margin > window.innerHeight) {
            top = window.innerHeight - cardHeight - margin;
        }
        // Sécurité bord haut
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

// 3. GESTION DE LA MODAL
function openModal(book, themeColor) {
    const modal = document.getElementById("book-modal");
    const modalContent = modal.querySelector(".modal-content");

    // Remplissage
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

    // Stats additionnelles
    const pagesEl = document.getElementById("modal-pages-main");
    const yearEl = document.getElementById("modal-year-main");
    if(pagesEl) pagesEl.innerText = book.pages || "N/A";
    if(yearEl) yearEl.innerText = book.year || "N/A";

    // Bouton YouTube
    const youtubeBtn = document.getElementById("link-youtube");
    if (youtubeBtn) {
        if (book.youtube) {
            youtubeBtn.href = book.youtube;
            youtubeBtn.style.display = "block";
        } else {
            youtubeBtn.style.display = "none";
        }
    }

    // --- LOGIQUE D'AFFICHAGE ---
    // On remonte le scroll de la modal au début
    if (modalContent) modalContent.scrollTop = 0;

    modal.classList.remove("hidden");
    
    // Bloque le scroll de la page de fond
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden'; 
}

// 4. FERMETURE
function closeModal() {
  const modalEl = document.getElementById("book-modal");
  modalEl.classList.add("hidden");
  
  // On libère le scroll
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

// Événements de fermeture
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
