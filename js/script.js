
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
const firebaseConfig = {
  apiKey: "AIzaSyDa1Ltp2pG0q0GvOntog4EEg21ixGzDF4E",
  authDomain: "l-alchimiste-du-temple.firebaseapp.com",
  databaseURL: "https://l-alchimiste-du-temple-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "l-alchimiste-du-temple",
  storageBucket: "l-alchimiste-du-temple.firebasestorage.app",
  messagingSenderId: "257593659996",
  appId: "1:257593659996:web:c93a30b392cc75e0f30c99",
  measurementId: "G-5GXYMWRXJR"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const table = document.querySelector(".table");
let allBooks = [];
let originalBooks = [];
let currentDisplayedBooks = [];
let isAlphaSorted = false;

const hCard = document.createElement("div");
hCard.className = "hover-card";
hCard.style.display = "none";
document.body.appendChild(hCard);

fetch("data/books.json")
  .then(res => res.json())
  .then(data => {
    allBooks = [...data];
    originalBooks = [...data];
    currentDisplayedBooks = [...data];
    renderTable(currentDisplayedBooks);
    initFilterLogic();
  });

function generateStarsHTML(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    let fillWidth = 0;
    if (rating >= i) fillWidth = 100;
    else if (rating > i - 1) fillWidth = (rating - (i - 1)) * 100;
    html += `
      <span class="star-container">
        ★
        <span class="star-fill" style="width:${fillWidth}%">★</span>
      </span>`;
  }
  return html;
}

function getThemeColor(theme) {
  const colors = { algérie: "#00bb06", nazisme: "#ff2d2d", islam: "#00ff8c", europe: "#ff7c1f", art: "#ffff00", philosophie: "#00e5ff" };
  return colors[theme.toLowerCase()] || "#008daa";
}

function renderTable(booksToDisplay) {
  currentDisplayedBooks = booksToDisplay;
  table.innerHTML = "";
  const cellWidth = 122; // 110 + 12
  const columns = Math.floor(table.offsetWidth / cellWidth);
  const minRows = 6;
  const totalRequiredSlots = Math.max(booksToDisplay.length, columns * minRows);
  const totalSlots = Math.ceil(totalRequiredSlots / columns) * columns;
  for (let i = 0; i < totalSlots; i++) {
    const book = booksToDisplay[i];
    const cell = document.createElement("div");
    if (book) {
      const themeColor = getThemeColor(book.theme);
      cell.className = `cell ${book.theme}`;
      cell.style.color = themeColor;
      cell.innerHTML = `
        <div class="number">${book.number}</div>
        <div class="code">${book.code}</div>
        <div class="title">${book.title}</div>
      `;
      cell.addEventListener("mouseenter", (e) => {
        if (window.innerWidth <= 768) return;
        showHoverCard(book, e);
      });
      cell.addEventListener("mousemove", (e) => {
        if (window.innerWidth <= 768 || hCard.style.display === "none") return;
        moveHoverCard(e);
      });
      cell.addEventListener("mouseleave", () => hideHoverCard());
      cell.addEventListener("click", () => openModal(book, themeColor));
    } else {
      cell.className = "empty-cell";
    }
    table.appendChild(cell);
  }
}

function showHoverCard(book, e) {
  const themeColor = getThemeColor(book.theme);
  const starsHTML = generateStarsHTML(book.rating);
  const displayRating = book.rating.toFixed(1).replace('.', ',')
  hCard.innerHTML = `
    <div class="hover-header">
      <div class="hover-rating-section">
    <div class="hover-score" style="color: #ffcc00;">${book.rating.toFixed(1).replace('.', ',')}</div>
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
  moveHoverCard(e);
}
function moveHoverCard(e) {
  const cardWidth = 450;
  const margin = 20;
  const left = e.clientX > window.innerWidth / 2 ? e.clientX - cardWidth - margin : e.clientX + margin;
  hCard.style.left = `${left}px`;
  hCard.style.top = `${e.clientY - 40}px`;
  hCard.style.opacity = "1";
}
function hideHoverCard() {
  hCard.style.display = "none";
  hCard.style.opacity = "0";
}

let lastWidth = window.innerWidth;
window.addEventListener("resize", () => {
  if (window.innerWidth !== lastWidth) {
    lastWidth = window.innerWidth;
    renderTable(currentDisplayedBooks);
  }
});

function initFilterLogic() {
  const filterWrapper = document.getElementById("filter-dropdown");
  const mainPanel = document.getElementById('main-panel');
  const categoryPanel = document.getElementById('category-panel');
  const ratingPanel = document.getElementById('rating-panel');
  const filterDisplay = document.querySelector(".filter-display");
  const alphaBtn = document.querySelector('[data-value="alpha"]');
  const openCatBtn = document.querySelector('[data-value="open-categories"]');
  const openRatingBtn = document.querySelector('[data-value="rating"]');
  const dropdownBox = filterWrapper.querySelector(".dropdown-box");
  const backBtn = document.getElementById('back-to-main');
  const backToMainRating = document.getElementById('back-to-main-rating');
  const applyBtn = document.getElementById('apply-filter');
  const applyRatingBtn = document.getElementById('apply-rating');
  const resetBtn = document.getElementById('reset-filter');
  const resetRatingBtn = document.getElementById('reset-rating');
  const categoryCheckboxes = document.querySelectorAll('.cat-check');
  const ratingCheckboxes = document.querySelectorAll('.rating-check');

  [categoryPanel, ratingPanel].forEach(panel => {
    if (panel) panel.addEventListener('click', e => e.stopPropagation());
  });
  function closeFilter() {
    filterWrapper.classList.remove("active");
    dropdownBox.classList.remove("show");
    mainPanel.classList.remove("show");
    if(categoryPanel) categoryPanel.classList.remove("show");
    if(ratingPanel) ratingPanel.classList.remove("show");
  }
  function applyAllFilters() {
    const checkedCats = Array.from(categoryCheckboxes).filter(cb => cb.checked).map(cb => cb.value.toLowerCase());
    const checkedRatings = Array.from(ratingCheckboxes).filter(cb => cb.checked).map(cb => parseInt(cb.value));
    let filtered = allBooks.filter(book => {
   
      const matchCat = checkedCats.length === 0 || checkedCats.includes(book.theme.toLowerCase());

      const matchRating = checkedRatings.length === 0 || checkedRatings.includes(Math.floor(book.rating));
      return matchCat && matchRating;
    });
    if (isAlphaSorted) filtered.sort((a,b) => a.title.localeCompare(b.title));
    renderTable(filtered);
    closeFilter();
  }

 filterDisplay.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const isActive = filterWrapper.classList.contains("active");
  if (!isActive) {

    filterWrapper.classList.add("active");
    dropdownBox.classList.add("show");
    mainPanel.classList.add("show");

    if(categoryPanel) categoryPanel.classList.remove("show");
    if(ratingPanel) ratingPanel.classList.remove("show");
  } else {

    filterWrapper.classList.remove("active");
    dropdownBox.classList.remove("show");
    mainPanel.classList.remove("show");
    if(categoryPanel) categoryPanel.classList.remove("show");
    if(ratingPanel) ratingPanel.classList.remove("show");
  }
});

 document.addEventListener("click", (e) => {
  if (!filterWrapper.contains(e.target)) {
    filterWrapper.classList.remove("active");
    dropdownBox.classList.remove("show");
    mainPanel.classList.remove("show");
    if(categoryPanel) categoryPanel.classList.remove("show");
    if(ratingPanel) ratingPanel.classList.remove("show");
  }
});

  if (openCatBtn) openCatBtn.addEventListener("click", e => { e.stopPropagation(); mainPanel.classList.remove("show"); categoryPanel.classList.add("show"); });
  if (openRatingBtn) openRatingBtn.addEventListener("click", e => { e.stopPropagation(); mainPanel.classList.remove("show"); ratingPanel.classList.add("show"); });
  if (backBtn) backBtn.addEventListener("click", e => { e.stopPropagation(); categoryPanel.classList.remove("show"); mainPanel.classList.add("show"); });
  if (backToMainRating) backToMainRating.addEventListener("click", e => { e.stopPropagation(); ratingPanel.classList.remove("show"); mainPanel.classList.add("show"); });

  if (alphaBtn) alphaBtn.addEventListener("click", e => { e.stopPropagation(); isAlphaSorted = !isAlphaSorted; alphaBtn.style.color = isAlphaSorted ? "#00d4ff" : "white"; applyAllFilters(); });
  if (applyBtn) applyBtn.addEventListener("click", applyAllFilters);
  if (applyRatingBtn) applyRatingBtn.addEventListener("click", applyAllFilters);
  if (resetBtn) resetBtn.addEventListener("click", e => { e.stopPropagation(); categoryCheckboxes.forEach(cb => cb.checked = false); applyAllFilters(); });
  if (resetRatingBtn) resetRatingBtn.addEventListener("click", e => { e.stopPropagation(); ratingCheckboxes.forEach(cb => cb.checked = false); applyAllFilters(); });
}

let unsubscribeLikes = null;
let unsubscribeDislikes = null;
function setupReactions(bookNumber) {
    const btnLike = document.getElementById('btn-like');
    const btnDislike = document.getElementById('btn-dislike');
    if (!btnLike || !btnDislike) return;


    if (unsubscribeLikes) unsubscribeLikes();
    if (unsubscribeDislikes) unsubscribeDislikes();
    const likeRef = ref(db, `reactions/${bookNumber}/likes`);
    const dislikeRef = ref(db, `reactions/${bookNumber}/dislikes`);

    const hasVoted = localStorage.getItem(`voted_${bookNumber}`);
    if (hasVoted) {
        btnLike.style.opacity = "0.3";
        btnDislike.style.opacity = "0.3";
        btnLike.style.pointerEvents = "none";
        btnDislike.style.pointerEvents = "none";
    } else {
        btnLike.style.opacity = "1";
        btnDislike.style.opacity = "1";
        btnLike.style.pointerEvents = "auto";
        btnDislike.style.pointerEvents = "auto";
    }

    unsubscribeLikes = onValue(likeRef, (snap) => {
        document.getElementById('count-like').innerText = snap.val() || 0;
    });
    unsubscribeDislikes = onValue(dislikeRef, (snap) => {
        document.getElementById('count-dislike').innerText = snap.val() || 0;
    });

    btnLike.onclick = null; 
    btnDislike.onclick = null;
    btnLike.onclick = (e) => {
        e.preventDefault();
        executeVote(bookNumber, 'likes', btnLike, btnDislike);
    };
    btnDislike.onclick = (e) => {
        e.preventDefault();
        executeVote(bookNumber, 'dislikes', btnLike, btnDislike);
    };
}

function openModal(book, themeColor) {
  const modal = document.getElementById("book-modal");
  document.getElementById("modal-img-main").src = book.image || "";
  document.getElementById("modal-title-main").innerText = book.title;
  document.getElementById("modal-author-main").innerText = book.author || "Unknown";
  document.getElementById("modal-description-main").innerText = book.description || "Aucune description disponible.";
  const badge = document.getElementById("modal-badge-main");
  badge.innerText = book.theme;
  badge.style.backgroundColor = themeColor;
document.getElementById("modal-rating-num").innerText = book.rating.toFixed(1).replace('.', ',');
  document.getElementById("modal-stars-main").innerHTML = generateStarsHTML(book.rating);
  document.getElementById("modal-pages-main").innerText = book.pages || "N/A";
  document.getElementById("modal-year-main").innerText = book.year || "N/A";
  const pagesElem = document.getElementById("modal-pages-main");
  const yearElem = document.getElementById("modal-year-main");
  if(pagesElem) pagesElem.innerText = book.pages || "N/A";
  if(yearElem) yearElem.innerText = book.year || "N/A";

 const buyBtn = document.getElementById("btn-buy-book");
if (buyBtn) {
  if (book.buyLink && book.buyLink.trim() !== "") {

    buyBtn.href = book.buyLink;
    buyBtn.target = "_blank";
    buyBtn.style.display = "inline-flex"; // On s'assure qu'il est visible
  } else {

    buyBtn.style.display = "none";
  }
}
  const moreDetailsBtn = document.querySelector(".btn-more-details");
if (moreDetailsBtn) {

  if (book.youtube && book.youtube.trim() !== "") {
    moreDetailsBtn.href = book.youtube;
    moreDetailsBtn.target = "_blank";
    moreDetailsBtn.style.display = "block"; // Ou "inline-block" selon ton CSS original
  } else {

    moreDetailsBtn.style.display = "none";
  }
}
  modal.classList.remove("hidden");
  document.body.style.overflow = 'hidden';
  setupReactions(book.number);
}
function closeModal() {
  document.getElementById("book-modal").classList.add("hidden");
  document.body.style.overflow = 'auto';
}
const closeBtn = document.getElementById("close-modal");
if (closeBtn) closeBtn.onclick = closeModal;

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

const keyBtn = document.getElementById("key-button");
const keyModal = document.getElementById("key-modal");
const closeKey = document.getElementById("close-key");

if (keyBtn) {
  keyBtn.onclick = () => {
    keyModal.classList.remove("hidden");
    document.body.style.overflow = 'hidden'; // Bloque le scroll
  };
}

if (closeKey) {
  closeKey.onclick = () => {
    keyModal.classList.add("hidden");
    document.body.style.overflow = 'auto';
  };
}
window.addEventListener("click", (e) => {
  if (e.target.id === "book-modal") closeModal();
  if (e.target === keyModal) {
    keyModal.classList.add("hidden");
    document.body.style.overflow = 'auto';
  }
});

document.addEventListener("DOMContentLoaded", () => {
    const welcomeModal = document.getElementById("welcome-modal");
    const closeWelcomeBtn = document.getElementById("close-welcome");
    if (!welcomeModal || !closeWelcomeBtn) return;

    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
        welcomeModal.style.display = "flex"; 
        setTimeout(() => {
            welcomeModal.style.opacity = "1";
        }, 10);
    } else {
        welcomeModal.style.display = "none";
    }
    function fadeOutWelcome() {
        welcomeModal.style.opacity = "0";
        welcomeModal.style.transition = "opacity 0.5s ease";
        setTimeout(() => {
            welcomeModal.style.display = "none";

            localStorage.setItem("hasSeenWelcome", "true");
        }, 500);
    }
    closeWelcomeBtn.addEventListener("click", fadeOutWelcome);
    welcomeModal.addEventListener("click", (e) => {
        if (e.target === welcomeModal) {
            fadeOutWelcome();
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const potionBtn = document.getElementById('potion-random');
   function createBubbles() {
    for (let i = 0; i < 12; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const size = Math.random() * 10 + 5 + 'px';
        const randomX = (Math.random() - 0.5) * 80 + 'px';
        bubble.style.width = size;
        bubble.style.height = size;
        bubble.style.left = '50%';
        bubble.style.top = '10px';
        bubble.style.setProperty('--random-x', randomX);
        bubble.style.animationDelay = Math.random() * 0.3 + 's';

        bubble.style.background = '#00ff8c'; 
        bubble.style.boxShadow = '0 0 10px #00ff8c';
        potionBtn.appendChild(bubble);
        setTimeout(() => bubble.remove(), 1000);
    }
    }
    if (potionBtn) {
        potionBtn.addEventListener('click', () => {
            const cells = document.querySelectorAll('.cell');
            if (cells.length === 0) return;

            createBubbles(); // On lance les bulles !
            potionBtn.classList.add('potion-active'); // On fait trembler la fiole

            potionBtn.style.pointerEvents = 'none';
            potionBtn.style.filter = 'brightness(1.5)'; 
            cells.forEach(cell => cell.classList.add('transmuting'));
            setTimeout(() => {
                cells.forEach(cell => cell.classList.remove('transmuting'));
                potionBtn.classList.remove('potion-active'); // On arrête de trembler
                const randomIndex = Math.floor(Math.random() * cells.length);
                const randomCell = cells[randomIndex];
                randomCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    randomCell.style.transition = "all 0.5s ease";
                    randomCell.style.boxShadow = "0 0 40px var(--glow-color)";
                    randomCell.click(); 
                    potionBtn.style.pointerEvents = 'auto';
                    potionBtn.style.filter = 'none';
                    setTimeout(() => randomCell.style.boxShadow = "", 1500);
                }, 500);
            }, 1200);
        });
    }
});
