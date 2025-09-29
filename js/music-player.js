(function () {
  if (window.musicPlayerInitialized) return;
  window.musicPlayerInitialized = true;

  const playlist = [
    { title: 'Sidekick', artist: 'pablopablo, guitarricadelafuente', src: 'https://files.catbox.moe/n2yn2a.mp3', spotify: 'https://open.spotify.com/intl-es/track/6KUasBYtaeWOdIbC1FZNbI?si=637d751426e24ec4' },
    { title: 'take me by the hand', artist: 'Oklou, Bladee', src: 'https://files.catbox.moe/1xfkve.mp3', spotify: 'https://open.spotify.com/intl-es/track/1oo8xwvtRep4Frhrpte5Eg?si=3c4b7b07c13f4e49' },
    { title: 'Look At Me Now', artist: 'Caroline Polachek', src: 'https://files.catbox.moe/ogivwa.mp3', spotify: 'https://open.spotify.com/intl-es/track/1z7Pc2fpIffOtXQh1XHMn9?si=bf5ee8414b6e4bf4' },
    { title: "Heavy Water/I'd rather be sleeping", artist: 'Grouper', src: 'https://files.catbox.moe/1e2hhl.mp3', spotify: 'https://open.spotify.com/intl-es/track/6IUwiHsyKAZtfBy37Wu4ij?si=bdd499f3dbe848cf' },
    { title: "I Don't Wanna Know", artist: 'Charli XCX', src: 'https://files.catbox.moe/bdlxk5.mp3', spotify: 'https://open.spotify.com/intl-es/track/2wsypbBdFwN1woTAh9sq6X?si=c1733515cedf4fb1' },
    { title: 'Heavenly', artist: 'Judeline, Rusowsky', src: 'https://files.catbox.moe/mw0prn.mp3', spotify: 'https://open.spotify.com/intl-es/track/5Bng1Bwy7PFQys6qByKmdT?si=360704f6a8644661' },
    { title: 'Being Harsh', artist: 'A.G. Cook', src: 'https://files.catbox.moe/pj7u67.mp3', spotify: 'https://open.spotify.com/intl-es/track/7vZujUVbXHIvRM4HPcBJlB?si=1fa98f9e670c4885' },
    { title: 'Mind Loaded', artist: 'Blood Orange', src: 'https://files.catbox.moe/4596m1.mp3', spotify: 'https://open.spotify.com/intl-es/track/04KHyqdGs5sVEWX6UnukF2?si=b913bd5f95754dbf' },
    { title: 'Go As a Dream', artist: 'Caroline Polachek', src: 'https://files.catbox.moe/hqorfu.mp3', spotify: 'https://open.spotify.com/intl-es/track/3nNN1uts4kwkdwwV1CzZaN?si=3a3ae409f67c4440' },
    { title: 'Dagger', artist: 'Slowdive', src: 'https://files.catbox.moe/882p88.mp3', spotify: 'https://open.spotify.com/intl-es/track/3MmRfG64qt04Efx9gK9Ec8?si=234b84c9c3154fe7' },
    { title: 'Nadie Sabe', artist: 'Ciutat, TRISTÁN!', src: 'https://files.catbox.moe/5476ts.mp3', spotify: 'https://open.spotify.com/intl-es/track/07Zg8kkvdzJDhWZYpqgZAE?si=6fc821a150b44d9e' },
    { title: 'Better Off Alone', artist: 'Alice Deejay', src: 'https://files.catbox.moe/5cnlxf.mp3', spotify: 'https://open.spotify.com/intl-es/track/5XVjNRubJUW0iPhhSWpLCj?si=4b0c243364264107' }
  ];

  function formatTime(t) {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function init() {
    const root = document.querySelector('.sidebar .player') || document.querySelector('.player');
    if (!root) {
      init._tries = (init._tries || 0) + 1;
      if (init._tries < 40) return setTimeout(init, 100);
      console.error('music-player: player element not found after multiple attempts');
      return;
    }

    if (root.dataset.mpInitialized) return;
    root.dataset.mpInitialized = 'true';

    const q = sel => root.querySelector(sel);
    const playBtn = q('#play');
    const prevBtn = q('#prev');
    const nextBtn = q('#next');
    const progressBar = q('#progress-bar');
    const progressBarBg = q('#progress-bar-bg');
    const titleLink = q('#spotify-link');
    const artistName = q('#artist-name');
    const currentTimeElem = q('#current-time');
    const durationElem = q('#duration');
    const volumeSlider = q('#volume-slider');

    if (!playBtn || !prevBtn || !nextBtn) {
      console.error('music-player: missing essential controls', { playBtn, prevBtn, nextBtn });
      return;
    }

    const audio = window.musicPlayerAudio = window.musicPlayerAudio || new Audio();
    let currentIndex = 0;
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    audio.src = playlist[currentIndex].src;

    let isPlaying = false;

    function updateSongInfo() {
      const s = playlist[currentIndex];
      if (titleLink) { titleLink.textContent = s.title; titleLink.href = s.spotify; }
      if (artistName) artistName.textContent = 'by ' + s.artist;
    }

    function updateAndPlay() {
      updateSongInfo();
      audio.src = playlist[currentIndex].src;
      audio.play().catch(e => console.warn('music-player: play() blocked (user gesture needed) or error:', e));
      isPlaying = true;
      playBtn.innerHTML = '⏸︎';
    }

    playBtn.addEventListener('click', () => {
      if (!isPlaying) {
        audio.play().catch(e => console.warn('music-player: play() blocked', e));
        isPlaying = true;
        playBtn.innerHTML = '⏸︎';
      } else {
        audio.pause();
        isPlaying = false;
        playBtn.innerHTML = '⏵︎';
      }
    });

    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      updateAndPlay();
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % playlist.length;
      updateAndPlay();
    });

    audio.addEventListener('timeupdate', () => {
      if (audio.duration && progressBar) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = progress + '%';
      }
      if (currentTimeElem) currentTimeElem.textContent = formatTime(audio.currentTime);
      if (durationElem && audio.duration) durationElem.textContent = formatTime(audio.duration);
    });

    if (progressBarBg) {
      progressBarBg.addEventListener('click', (e) => {
        const rect = progressBarBg.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (audio.duration) audio.currentTime = (clickX / rect.width) * audio.duration;
      });
    }

    if (volumeSlider) {
      volumeSlider.value = (!isNaN(audio.volume) ? audio.volume : 1);
      audio.volume = Number(volumeSlider.value);

      function updateVolumeBackground(slider) {
        const value = slider.value;
        slider.style.background = `linear-gradient(to right, #ac67baff 0%, #ac67baff ${value*100}%, #EACAEE ${value*100}%, #EACAEE 100%)`;
      }

      volumeSlider.addEventListener('input', (e) => {
        audio.volume = Number(e.target.value);
        updateVolumeBackground(volumeSlider);
      });

      updateVolumeBackground(volumeSlider);
    }

    audio.addEventListener('ended', () => { nextBtn.click(); });

    updateSongInfo();
  }

  init();
})();