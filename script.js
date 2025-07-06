document.addEventListener("DOMContentLoaded", function () {
  const songs = [...nonstopSongs, ...houselakSongs];
  // Global player elements
  const audio = new Audio();
  let currentSongIndex = -1;
  let allSongCards = [];
  let isDragging = false;
  let isShuffle = false;
  let repeatMode = 'none'; // 'none', 'one', 'all'

  // Player bar elements
  const playPauseBtn = document.getElementById('play-pause-btn');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const repeatBtn = document.getElementById('repeat-btn');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const playerSongTitle = document.querySelector('.player-song-title');
  const playerProgressBar = document.querySelector('.player-progress-bar');
  const playerProgress = document.querySelector('.player-progress');
  const currentTimeEl = document.querySelector('.player-time-current');
  const durationEl = document.querySelector('.player-time-duration');
  const volumeBtn = document.getElementById('volume-btn');
  const volumePopup = document.querySelector('.volume-popup');
  const volumeSlider = document.querySelector('.volume-slider');
  const volumeSection = document.querySelector('.player-volume-section');

  // Other elements
  const searchInput = document.getElementById('searchInput');
  const popup = document.getElementById("popup");
  const tabNonstop = document.getElementById('tab-nonstop');
  const tabHouselak = document.getElementById('tab-houselak');
  const colNonstop = document.getElementById('playlist-nonstop-col');
  const colHouselak = document.getElementById('playlist-houselak-col');
  const playlistNonstopEl = document.getElementById("playlist-nonstop");
  const playlistHouselakEl = document.getElementById("playlist-houselak");

  // --- FUNCTIONS ---

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function updateProgress() {
    if (audio.duration) {
      const percent = (audio.currentTime / audio.duration) * 100;
      playerProgress.style.width = percent + "%";
      currentTimeEl.textContent = formatTime(audio.currentTime);
    }
  }

  function loadSong(songIndex) {
    if (songIndex < 0 || songIndex >= songs.length) return;
    
    const song = songs[songIndex];
    currentSongIndex = songIndex;
    audio.src = song.src;
    playerSongTitle.textContent = song.title;
    document.title = song.title + ' - Made By Teo';

    allSongCards.forEach(card => {
      card.classList.toggle('playing', parseInt(card.dataset.idx) === songIndex);
    });
    
    playCurrentSong();
  }

  function playCurrentSong() {
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  }

  function pauseCurrentSong() {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  }

  function playNext() {
    if (isShuffle) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * songs.length);
      } while (nextIndex === currentSongIndex);
      loadSong(nextIndex);
    } else {
      loadSong((currentSongIndex + 1) % songs.length);
    }
  }

  function playPrev() {
    loadSong((currentSongIndex - 1 + songs.length) % songs.length);
  }

  // --- PLAYLIST & CARD GENERATION ---

  function createSongCard(song, originalIndex) {
    return `
      <div class="song-card" data-idx="${originalIndex}">
        <h2 class="song-title${song.rainbow ? ' rainbow-text2' : ''}">${song.title}</h2>
        <i class="fas fa-play play-btn-icon"></i>
      </div>
    `;
  }

  const nonstopSongsHtml = songs.map((s, i) => (s.category === 'nonstop' ? createSongCard(s, i) : '')).join("");
  const houselakSongsHtml = songs.map((s, i) => (s.category === 'houselak' ? createSongCard(s, i) : '')).join("");

  playlistNonstopEl.innerHTML = nonstopSongsHtml;
  playlistHouselakEl.innerHTML = houselakSongsHtml;
  
  allSongCards = document.querySelectorAll(".song-card");

  // --- EVENT LISTENERS ---

  // Player bar controls
  playPauseBtn.addEventListener('click', () => {
    if (currentSongIndex === -1) {
      const rainbowSongIndex = songs.findIndex(song => song.rainbow);
      if (rainbowSongIndex !== -1) {
        loadSong(rainbowSongIndex);
      } else {
        loadSong(0); // Fallback to the first song
      }
    } else {
      audio.paused ? playCurrentSong() : pauseCurrentSong();
    }
  });
  nextBtn.addEventListener('click', playNext);
  prevBtn.addEventListener('click', playPrev);
  shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
  });
  repeatBtn.addEventListener('click', () => {
    if (repeatMode === 'none') {
      repeatMode = 'all';
      repeatBtn.classList.add('active');
      repeatBtn.innerHTML = '<i class="fas fa-redo-alt"></i>'; // Icon for repeat all
    } else if (repeatMode === 'all') {
      repeatMode = 'one';
      repeatBtn.innerHTML = '<i class="fas fa-retweet"></i>'; // Icon for repeat one
    } else {
      repeatMode = 'none';
      repeatBtn.classList.remove('active');
      repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
    }
  });

  // Audio element events
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
    updateProgress();
  });
  audio.addEventListener('ended', () => {
    if (repeatMode === 'one') {
      loadSong(currentSongIndex);
    } else if (repeatMode === 'all') {
      playNext();
    } else {
      // 'none'
      if (currentSongIndex < songs.length - 1) {
        playNext();
      } else {
        pauseCurrentSong();
      }
    }
  });

  // Progress bar seeking (smooth scrubbing)
  function scrub(e) {
    const rect = playerProgressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = Math.min(100, Math.max(0, (clickX / width) * 100));
    playerProgress.style.width = percent + "%";
    const newTime = (clickX / width) * audio.duration;
    if (newTime >= 0 && newTime <= audio.duration) {
        audio.currentTime = newTime;
        currentTimeEl.textContent = formatTime(newTime);
    }
  }
  playerProgressBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    scrub(e);
  });
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      scrub(e);
    }
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Volume control
  volumeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent this click from immediately closing the popup
    volumePopup.classList.toggle('visible');
  });

  // Hide popup when clicking anywhere else
  document.addEventListener('click', (e) => {
    if (!volumeSection.contains(e.target) && volumePopup.classList.contains('visible')) {
      volumePopup.classList.remove('visible');
    }
  });

  // Prevent clicks inside the popup from closing it
  volumePopup.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
    // Also update the icon based on volume
    const icon = volumeBtn.querySelector('i');
    if (audio.volume > 0.5) {
        icon.className = 'fas fa-volume-up';
    } else if (audio.volume > 0) {
        icon.className = 'fas fa-volume-down';
    } else {
        icon.className = 'fas fa-volume-mute';
    }
  });


  // Song card clicks
  allSongCards.forEach(card => {
    card.addEventListener('click', () => {
      const songIndex = parseInt(card.dataset.idx);
      loadSong(songIndex);
    });
  });

  // Tab switching
  const highlighter = document.querySelector('.active-tab-highlighter');
  const tabs = document.querySelectorAll('.playlist-tab');
  const scrollPositions = { nonstop: 0, houselak: 0 };
  let activeTab = 'nonstop';

  function moveHighlighter(tab) {
    highlighter.style.width = `${tab.offsetWidth}px`;
    highlighter.style.height = `${tab.offsetHeight}px`;
    highlighter.style.transform = `translateX(${tab.offsetLeft}px)`;
  }

  function switchTab(newTab) {
    if (activeTab === newTab) return;

    // Save current scroll position
    scrollPositions[activeTab] = window.scrollY || document.documentElement.scrollTop;

    // Update active tab
    activeTab = newTab;

    // Update UI
    tabs.forEach(t => t.classList.remove('active'));
    const newActiveTab = document.getElementById(`tab-${newTab}`);
    newActiveTab.classList.add('active');
    moveHighlighter(newActiveTab);

    colNonstop.classList.toggle('playlist-hidden', newTab !== 'nonstop');
    colHouselak.classList.toggle('playlist-hidden', newTab !== 'houselak');

    // Restore new tab's scroll position
    window.scrollTo(0, scrollPositions[newTab]);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const newTab = tab.id.replace('tab-', '');
      switchTab(newTab);
    });
  });

  // Initial highlighter position
  moveHighlighter(document.querySelector('.playlist-tab.active'));

  // Search
  let notFoundMsg = null;
  if (searchInput) {
    notFoundMsg = document.createElement('div');
    notFoundMsg.textContent = 'Không tìm thấy bài hát.';
    notFoundMsg.style.cssText = 'color:#bbb;text-align:center;padding:16px 0;display:none;font-size:1.1rem;';
    playlistNonstopEl.parentNode.insertBefore(notFoundMsg, playlistNonstopEl);
    
    searchInput.addEventListener('input', function() {
      const keyword = this.value.trim().toLowerCase();
      let found = 0;
      allSongCards.forEach(card => {
        const title = card.querySelector('.song-title').textContent.toLowerCase();
        if (title.includes(keyword)) {
          card.style.display = 'flex';
          found++;
        } else {
          card.style.display = 'none';
        }
      });
      notFoundMsg.style.display = found === 0 ? '' : 'none';
    });
  }

  // Popup
  setTimeout(() => {
    if (popup) popup.classList.add("show");
  }, 1000);
});

// Global function for popup
function closePopup() {
  let popup = document.getElementById("popup");
  if (popup) {
    popup.classList.remove("show");
    setTimeout(() => {
      popup.style.display = "none";
    }, 500);
  }
}
