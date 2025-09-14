(function () {
  if (window.musicPlayerInitialized) return;
  window.musicPlayerInitialized = true;

  const playlist = [
    { title: 'Somebodys Watching Me', artist: 'Rockwell', src: 'https://files.catbox.moe/k77chw.mp3', spotify: 'https://open.spotify.com/track/6A4Jc8npNo79BOgsrPptLA?si=a16dae273ea844f4' },
    { title: 'A Forest', artist: 'The Cure', src: 'https://files.catbox.moe/lrerwi.mp3', spotify: 'https://open.spotify.com/track/3O4TPMOgChXOerSdB5WENH?si=f941abdc44ae454d' },
    { title: 'Goo Goo Muck', artist: 'The Cramps', src: 'https://files.catbox.moe/290yuj.mp3', spotify: 'https://open.spotify.com/track/3EEd6ldsPat620GVYMEhOP?si=32890f9b7a4f4737' },
    { title: 'Run To You', artist: 'Bryan Adams', src: 'https://files.catbox.moe/71v0yc.mp3', spotify: 'https://open.spotify.com/track/2RWFncSWZEhSRRifqiDNVV?si=357990f7bdec4cdc' },
    { title: 'Pet Sematary', artist: 'Ramones', src: 'https://files.catbox.moe/qygx9f.mp3', spotify: 'https://open.spotify.com/track/2PN0JeaGtkHrlcmwZFWzBM?si=cf5d3602f5db4fe6' },
    { title: 'Very Spooky', artist: 'Mac Demarco', src: 'https://files.catbox.moe/s7gb4l.mp3', spotify: 'https://open.spotify.com/track/3w5lN6GQaBLqwgTTafjyOs?si=c964c3e526994729' },
    { title: 'Ghostbusters', artist: 'Ray Parker Jr.', src: 'https://files.catbox.moe/qfax5g.mp3', spotify: 'https://open.spotify.com/track/6QGI6v91UlqSytTDVKZIUP?si=e5712cdd3bcf4c07' },
    { title: 'Lies In The Eyes Of Love', artist: 'Part Time', src: 'https://files.catbox.moe/mp9ycc.mp3', spotify: 'https://open.spotify.com/track/5JQuDFh7QKTjJDoEQAmaO8?si=72944150f70d40a5' },
    { title: 'Dead Mans Party', artist: 'Oingo Boingo', src: 'https://files.catbox.moe/t062vf.mp3', spotify: 'https://open.spotify.com/track/2h47SG8bNphmicAll4H9RV?si=887b915459934dac' },
    { title: 'Candyman', artist: 'Siouxsie and the Banshees', src: 'https://files.catbox.moe/eta8xv.mp3', spotify: 'https://open.spotify.com/track/2DNDL86nEvF4HKw6F0U9J1?si=3a57b1d1a33d47d4' }
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

    // prevent adding listeners twice on the same root
    if (root.dataset.mpInitialized) return;
    root.dataset.mpInitialized = 'true';

    // Query elements inside the player root (safer than global IDs)
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

    // single shared audio instance (keeps playing state if you navigate dynamically)
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
      playBtn.innerHTML = '&#10074;&#10074;';
    }

    playBtn.addEventListener('click', () => {
      if (!isPlaying) {
        audio.play().catch(e => console.warn('music-player: play() blocked', e));
        isPlaying = true;
        playBtn.innerHTML = '&#10074;&#10074;';
      } else {
        audio.pause();
        isPlaying = false;
        playBtn.innerHTML = '&#9654;';
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
      volumeSlider.addEventListener('input', (e) => { audio.volume = Number(e.target.value); });
      volumeSlider.value = (!isNaN(audio.volume) ? audio.volume : 1);
    }

    audio.addEventListener('ended', () => { nextBtn.click(); });

    updateSongInfo();
  }

  // Try to init immediately; if the sidebar is injected later the function will retry.
  init();
})();