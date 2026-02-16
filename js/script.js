const table = document.querySelector(".table");
let allBooks = [];
let originalBooks = [];
let isAlphaSorted = false;
const hCard = document.createElement("div");
hCard.className = "hover-card";
hCard.style.display = "none";
document.body.appendChild(hCard);

// 1. CHARGEMENT DES DONNÉES
fetch("data/books.json")
  .then(res => res.json())
  .then(data => {
    allBooks = data;
    originalBooks = [...data];
    renderTable(allBooks);
    initFilterLogic();
  });

function getThemeColor(theme) {
  const colors = { algérie: "#00bb06", nazisme: "#ff2d2d", islam: "#00ff8c", europe: "#ff7c1f", art: "#ffff00", philosophie: "#00e5ff" };
  return colors[theme.toLowerCase()] || "#008daa";
}
// 2. RENDU DU TABLEAU
function renderTable(booksToDisplay) {
  table.innerHTML = "";

  // 1. On calcule combien de colonnes peut contenir l'écran
  // (On divise la largeur de la table par la largeur d'une cellule + gap)
  const cellWidth = 110 + 12; // largeur cellule + gap
  const columns = Math.floor(table.offsetWidth / cellWidth);
  
  // 2. On définit un nombre de lignes minimum (ex: 5) ou on calcule pour remplir la hauteur
  const minRows = 6; 
  const totalRequiredSlots = Math.max(booksToDisplay.length, columns * minRows);
  
  // 3. On arrondit au multiple de colonnes supérieur pour finir la ligne proprement
  const totalSlots = Math.ceil(totalRequiredSlots / columns) * columns;

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
        if (window.innerWidth <= 768) return; // ⛔ mobile
        const starsHTML = "★".repeat(book.rating) + "☆".repeat(5 - book.rating);
        hCard.innerHTML = `
          <div class="hover-header">
            <div class="hover-rating-section">
              <div class="hover-score" style="color: #ffcc00;">${book.rating}.0</div>
              <div class="hover-stars" style="color: #ffcc00;">${starsHTML}</div>
              <span class="hover-rating-label">My rating</span>
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
        if (window.innerWidth <= 768) return;
        if (window.innerWidth <= 768 || hCard.style.display === "none") return;
        const cardWidth = 450;
        const margin = 20;
        let left = e.clientX > window.innerWidth / 2 ? e.clientX - cardWidth - margin : e.clientX + margin;
        let top = e.clientY - 40;
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
      // Pour les cases vides après tes livres
      const empty = document.createElement("div");
      empty.className = "empty-cell";
      table.appendChild(empty);
    }
  }
}

// Optionnel : Relancer le calcul si l'utilisateur redimensionne sa fenêtre
window.addEventListener('resize', () => {
    // On repasse les livres actuels pour rafraîchir le nombre de cases vides
    renderTable(allBooks); 
});
             

// 3. LOGIQUE DE FILTRAGE
function initFilterLogic() {
  const filterWrapper = document.getElementById("filter-dropdown");
  const mainPanel = document.getElementById('main-panel');
  const categoryPanel = document.getElementById('category-panel');
  const ratingPanel = document.getElementById('rating-panel');
  
  const filterDisplay = document.querySelector(".filter-display");
  const alphaBtn = document.querySelector('[data-value="alpha"]');
  const openCatBtn = document.querySelector('[data-value="open-categories"]');
  const openRatingBtn = document.querySelector('[data-value="rating"]');
  
  const backBtn = document.getElementById('back-to-main');
  const backToMainRating = document.getElementById('back-to-main-rating');
  
  const applyBtn = document.getElementById('apply-filter');
  const applyRatingBtn = document.getElementById('apply-rating');
  
  const categoryCheckboxes = document.querySelectorAll('.cat-check');
  const ratingCheckboxes = document.querySelectorAll('.rating-check');
  
  const resetBtn = document.getElementById('reset-filter');
  const resetRatingBtn = document.getElementById('reset-rating');
  if (ratingPanel) {
  ratingPanel.onclick = (e) => {
    e.stopPropagation();
  };
}

// Fais la même chose pour le panneau catégorie si ce n'est pas déjà fait
if (categoryPanel) {
  categoryPanel.onclick = (e) => {
    e.stopPropagation();
  };
}

  // FONCTION FERMER TOUS LES MENUS
  function closeFilter() {
    filterWrapper.classList.remove("active");
    mainPanel.classList.remove("show");
    categoryPanel.classList.remove("show");
    if (ratingPanel) ratingPanel.classList.remove("show");
  }

  // FONCTION DE FILTRAGE GLOBALE
  function applyAllFilters() {
    const checkedCats = Array.from(categoryCheckboxes).filter(cb => cb.checked).map(cb => cb.value.toLowerCase());
    const checkedRatings = Array.from(ratingCheckboxes).filter(cb => cb.checked).map(cb => parseInt(cb.value));

    let filtered = allBooks.filter(book => {
      const matchCat = checkedCats.length === 0 || checkedCats.includes(book.theme.toLowerCase());
      const matchRating = checkedRatings.length === 0 || checkedRatings.includes(book.rating);
      return matchCat && matchRating;
    });

    if (isAlphaSorted) {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    renderTable(filtered);
    closeFilter();
  }

  // ÉVÉNEMENTS D'OUVERTURE
  filterDisplay.onclick = (e) => {
    e.stopPropagation();
    if (filterWrapper.classList.contains("active")) closeFilter();
    else {
      filterWrapper.classList.add("active");
      mainPanel.classList.add("show");
    }
  };

  document.addEventListener("click", (e) => {
    if (filterWrapper.classList.contains("active") && !filterWrapper.contains(e.target)) closeFilter();
  });

  // NAVIGATION ENTRE PANNEAUX
  if (openCatBtn) {
    openCatBtn.onclick = (e) => {
      e.stopPropagation();
      mainPanel.classList.remove("show");
      categoryPanel.classList.add("show");
    };
  }

  if (openRatingBtn) {
    openRatingBtn.onclick = (e) => {
      e.stopPropagation();
      mainPanel.classList.remove("show");
      ratingPanel.classList.add("show");
    };
  }

  if (backBtn) {
    backBtn.onclick = (e) => {
      e.stopPropagation();
      categoryPanel.classList.remove("show");
      mainPanel.classList.add("show");
    };
  }

  if (backToMainRating) {
    backToMainRating.onclick = (e) => {
      e.stopPropagation();
      ratingPanel.classList.remove("show");
      mainPanel.classList.add("show");
    };
  }

  // ACTIONS (TRI, APPLY, RESET)
  if (alphaBtn) {
    alphaBtn.onclick = (e) => {
      e.stopPropagation();
      isAlphaSorted = !isAlphaSorted;
      alphaBtn.style.color = isAlphaSorted ? "#00d4ff" : "white";
      applyAllFilters();
    };
  }

  if (applyBtn) applyBtn.onclick = applyAllFilters;
  if (applyRatingBtn) applyRatingBtn.onclick = applyAllFilters;

  if (resetBtn) {
    resetBtn.onclick = (e) => {
      e.stopPropagation();
      categoryCheckboxes.forEach(cb => cb.checked = false);
      applyAllFilters();
    };
  }

  if (resetRatingBtn) {
    resetRatingBtn.onclick = (e) => {
      e.stopPropagation();
      ratingCheckboxes.forEach(cb => cb.checked = false);
      applyAllFilters();
    };
  }
}

// 4. MODAL
function openModal(book, themeColor) {
  const modal = document.getElementById("book-modal");
  document.getElementById("modal-img-main").src = book.image || "";
  document.getElementById("modal-title-main").innerText = book.title;
  document.getElementById("modal-author-main").innerText = book.author || "Unknown";
  document.getElementById("modal-description-main").innerText = book.description || "Aucune description disponible.";
  const badge = document.getElementById("modal-badge-main");
  badge.innerText = book.theme;
  badge.style.backgroundColor = themeColor;
  document.getElementById("modal-rating-num").innerText = `${book.rating}.0`;
  document.getElementById("modal-stars-main").innerHTML = "★".repeat(book.rating) + "☆".repeat(5 - book.rating);
  document.getElementById("modal-pages-main").innerText = book.pages || "N/A";
  document.getElementById("modal-year-main").innerText = book.year || "N/A";
  
  const pagesElem = document.getElementById("modal-pages-main");
  const yearElem = document.getElementById("modal-year-main");
  if(pagesElem) pagesElem.innerText = book.pages || "N/A";
  if(yearElem) yearElem.innerText = book.year || "N/A";

  // Gestion du bouton ACHETER (Lien externe)
  const buyBtn = document.getElementById("btn-buy-book");
  if (buyBtn) {
    buyBtn.href = book.buyLink || "https://www.amazon.fr"; // Utilise le lien du JSON ou un défaut
    buyBtn.target = "_blank";
  }
  const moreDetailsBtn = document.querySelector(".btn-more-details");
  if (moreDetailsBtn) {
    moreDetailsBtn.href = book.youtube || "https://www.youtube.com";
    moreDetailsBtn.target = "_blank";
  }
  modal.classList.remove("hidden");
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById("book-modal").classList.add("hidden");
  document.body.style.overflow = 'auto';
}

const closeBtn = document.getElementById("close-modal");
if (closeBtn) closeBtn.onclick = closeModal;
window.onclick = (e) => { if (e.target.id === "book-modal") closeModal(); };

// --- GESTION DU CONTACT ET EMAILJS ---
(function() { emailjs.init("MEZOTNid9-GNFm1ju"); })();

const contactBtn = document.getElementById("contact-btn");
const contactModal = document.getElementById("contact-modal");
const closeContact = document.getElementById("close-contact");
const contactForm = document.getElementById("contact-form");

contactBtn.addEventListener("click", () => contactModal.classList.remove("hidden"));

const hideContactModal = () => contactModal.classList.add("hidden");
closeContact.addEventListener("click", hideContactModal);
contactModal.addEventListener("click", (e) => { if (e.target === contactModal) hideContactModal(); });

contactForm.addEventListener("submit", function(event) {
  event.preventDefault();
  const submitBtn = this.querySelector('button');
  submitBtn.innerText = "Sending...";
  submitBtn.disabled = true;

  emailjs.sendForm('GOCSPX-hqy2d0S5yIj-rySrf', 'template_7fvqyhd', this)
    .then(() => {
      alert('Message sent successfully!');
      submitBtn.innerText = "Send";
      submitBtn.disabled = false;
      contactForm.reset();
      hideContactModal();
    }, (error) => {
      alert('Failed to send... ' + JSON.stringify(error));
      submitBtn.innerText = "Send";
      submitBtn.disabled = false;
    });
});
// Sélection des éléments
const keyBtn = document.querySelector(".pill-button"); // Ton bouton "KEY"
const keyModal = document.getElementById("key-modal");
const closeKey = document.getElementById("close-key");

// Ouvrir la modal Key
if (keyBtn) {
  keyBtn.onclick = () => {
    keyModal.classList.remove("hidden");
    document.body.style.overflow = 'hidden'; // Bloque le scroll
  };
}

// Fermer la modal Key
if (closeKey) {
  closeKey.onclick = () => {
    keyModal.classList.add("hidden");
    document.body.style.overflow = 'auto';
  };
}

// Fermer si on clique à côté de la modal
window.addEventListener("click", (e) => {
  if (e.target === keyModal) {
    keyModal.classList.add("hidden");
    document.body.style.overflow = 'auto';
  }
});
