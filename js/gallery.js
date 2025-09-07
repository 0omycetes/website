const cards = document.querySelectorAll('.gallery-card');
const overlay = document.getElementById('review-overlay');
const reviewImg = document.getElementById('review-img');
const textBox = document.getElementById('text-box');
const titleEl = document.getElementById('movie-title');
const infoEl = document.getElementById('movie-info');
const reviewEl = document.getElementById('movie-review');
const closeBtn = document.getElementById('close-btn');

cards.forEach(card => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img');
    reviewImg.src = img.src;

    // If card has data attributes → media mode
    if (card.dataset.title) {
      textBox.style.display = 'flex';
      titleEl.innerHTML = card.dataset.title;
      infoEl.innerHTML = `${card.dataset.year} • ${card.dataset.director} • ${card.dataset.rating}`;
      reviewEl.innerHTML = card.dataset.review;
    } else {
      // Art mode → hide text box
      textBox.style.display = 'none';
    }

    overlay.style.display = 'flex';
  });
});

closeBtn.addEventListener('click', () => {
  overlay.style.display = 'none';
});
