function initGallery() {
    const cards = document.querySelectorAll('.gallery-card');
    const overlay = document.getElementById('review-overlay');
    const reviewImg = document.getElementById('review-img');
    const textBox = document.getElementById('text-box');
    const titleEl = document.getElementById('movie-title');
    const infoEl = document.getElementById('movie-info');
    const reviewEl = document.getElementById('movie-review');
    const closeBtn = document.getElementById('close-btn');

    if (!cards.length) return;

    cards.forEach(card => {
      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        reviewImg.src = img.src;

        if (card.dataset.title) {
          textBox.style.display = 'flex';
          titleEl.innerHTML = card.dataset.title;
          infoEl.innerHTML = `${card.dataset.year} &#124; ${card.dataset.director} &#124; ${card.dataset.rating}`;
          reviewEl.innerHTML = card.dataset.review;
        } else {
          textBox.style.display = 'none';
        }

        overlay.style.display = 'flex';
      });
    });

    closeBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
    });
}