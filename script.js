document.addEventListener("DOMContentLoaded", function () {
  const introScreen = document.getElementById('intro-screen');
  const popup = document.getElementById("popup");
  const lastShown = localStorage.getItem('lastShown');
  const now = new Date().getTime();
  const tenMinutes = 10 * 60 * 1000;

  if (!lastShown || (now - lastShown > tenMinutes)) {
    setTimeout(() => { introScreen.classList.add('hidden'); }, 2000); // Hide after 2s
    setTimeout(() => { if (popup) popup.classList.add("show"); }, 2500); // Show popup after
    localStorage.setItem('lastShown', now);
  } else {
    introScreen.style.display = 'none';
    if (popup) popup.style.display = 'none';
  }

  const audio = new Audio();
  let currentSongIndex = -1;
  let activePlaylist = 'nonstop'; // 'nonstop' or 'houselak'
  let currentPlaylistSongs = nonstopSongs;
  let previousState = null;
  let allSongCards = [];
  let isDragging = false;
  let isShuffle = false;
  let repeatMode = 'none';
  let throttleTimeout = null;

  const undoBtn = document.getElementById('undo-btn');
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
  const searchInput = document.getElementById('searchInput');
  const tabNonstop = document.getElementById('tab-nonstop');
  const tabHouselak = document.getElementById('tab-houselak');
  const tabComingSoon = document.getElementById('tab-comingsoon');
  const colNonstop = document.getElementById('playlist-nonstop-col');
  const colHouselak = document.getElementById('playlist-houselak-col');
  const colComingSoon = document.getElementById('playlist-comingsoon-col');
  const playlistNonstopEl = document.getElementById("playlist-nonstop");
  const playlistHouselakEl = document.getElementById("playlist-houselak");
  
  const analyticPopup = document.getElementById('analytic-popup');
  const analyticIcon = document.getElementById('analytic-icon');
  const closeAnalyticPopup = document.getElementById('close-analytic-popup');

  if (analyticIcon) {
    analyticIcon.addEventListener('click', () => {
      if (analyticPopup) analyticPopup.classList.add('show');
    });
  }

  if (closeAnalyticPopup) {
    closeAnalyticPopup.addEventListener('click', () => {
      if (analyticPopup) analyticPopup.classList.remove('show');
    });
  }
  

  function saveState() {
    if (currentSongIndex !== -1) {
      const state = {
        songIndex: currentSongIndex,
        activePlaylist: activePlaylist,
        currentTime: audio.currentTime,
        volume: audio.volume,
        isShuffle: isShuffle,
        repeatMode: repeatMode
      };
      localStorage.setItem('musicPlayerState', JSON.stringify(state));
    }
  }

  function loadState() {
    const savedState = localStorage.getItem('musicPlayerState');
    if (savedState) {
      const state = JSON.parse(savedState);
      activePlaylist = state.activePlaylist || 'nonstop';
      switchTab(activePlaylist, true); // Switch tab without saving scroll pos
      
      currentSongIndex = state.songIndex;
      const song = currentPlaylistSongs[currentSongIndex];
      if(song) {
        audio.src = song.src;
        audio.currentTime = state.currentTime;
        playerSongTitle.textContent = song.title;
        document.title = song.title + ' - Made By Teo';
        updatePlayingClass();
      }

      audio.volume = state.volume || 1;
      volumeSlider.value = state.volume || 1;
      isShuffle = state.isShuffle || false;
      shuffleBtn.classList.toggle('active', isShuffle);
      repeatMode = state.repeatMode || 'none';
      if (repeatMode === 'all') {
        repeatBtn.classList.add('active');
        repeatBtn.innerHTML = '<i class="fas fa-redo-alt"></i>';
      } else if (repeatMode === 'one') {
        repeatBtn.classList.add('active');
        repeatBtn.innerHTML = '<i class="fas fa-retweet"></i>';
      }
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return (h > 0 ? `${h}:${m.toString().padStart(2, '0')}:` : '') + `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function updateProgress() {
    if (audio.duration) {
      playerProgress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
      currentTimeEl.textContent = formatTime(audio.currentTime);
    }
  }

  function throttledUpdateProgress() {
    if (!throttleTimeout) {
      throttleTimeout = setTimeout(() => {
        updateProgress();
        throttleTimeout = null;
      }, 250); // Update every 250ms
    }
  }
  
  function updatePlayingClass() {
      allSongCards.forEach(card => {
        const cardPlaylist = card.closest('#playlist-nonstop-col') ? 'nonstop' : 'houselak';
        const isPlaying = card.dataset.idx == currentSongIndex && cardPlaylist === activePlaylist;
        card.classList.toggle('playing', isPlaying);
        if (isPlaying) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
  }

  function loadSong(songIndex, restoreTime = 0) {
    if (songIndex < 0 || songIndex >= currentPlaylistSongs.length) return;

    if (currentSongIndex !== -1 && songIndex !== currentSongIndex) {
      previousState = { songIndex: currentSongIndex, currentTime: audio.currentTime, playlist: activePlaylist };
      undoBtn.style.opacity = '1';
      undoBtn.style.pointerEvents = 'auto';
    }

    currentSongIndex = songIndex;
    const song = currentPlaylistSongs[currentSongIndex];
    audio.src = song.src;
    audio.currentTime = restoreTime;
    playerSongTitle.textContent = song.title;
    document.title = song.title + ' - Made By Teo';
    
    updatePlayingClass();
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
        nextIndex = Math.floor(Math.random() * currentPlaylistSongs.length);
      } while (nextIndex === currentSongIndex);
      loadSong(nextIndex);
    } else {
      loadSong((currentSongIndex + 1) % currentPlaylistSongs.length);
    }
  }

  function playPrev() {
    loadSong((currentSongIndex - 1 + currentPlaylistSongs.length) % currentPlaylistSongs.length);
  }

  function createSongCard(song, index, playlistIndex) {
    const delay = playlistIndex * 0.05;
    return `
      <div class="song-card" data-idx="${index}" style="animation-delay: ${delay}s; transform: translateX(-30px);">
        <h2 class="song-title${song.rainbow ? ' rainbow-text2' : ''}">${song.title}</h2>
        <i class="fas fa-play play-btn-icon"></i>
      </div>
    `;
  }

  function renderPlaylists() {
      playlistNonstopEl.innerHTML = nonstopSongs.map((s, i) => createSongCard(s, i, i)).join("");
      playlistHouselakEl.innerHTML = houselakSongs.map((s, i) => createSongCard(s, i, i)).join("");
      updateSongCardListeners();
  }
  
  function updateSongCardListeners() {
      allSongCards = document.querySelectorAll(".song-card");
      allSongCards.forEach(card => {
        card.addEventListener('click', () => {
            const songIndex = parseInt(card.dataset.idx);
            const cardPlaylist = card.closest('#playlist-nonstop-col') ? 'nonstop' : 'houselak';
            if (activePlaylist !== cardPlaylist) {
                switchTab(cardPlaylist, false, () => loadSong(songIndex));
            } else {
                loadSong(songIndex);
            }
        });
      });
  }

  undoBtn.style.opacity = '0.5';
  undoBtn.style.pointerEvents = 'none';
  undoBtn.addEventListener('click', () => {
    if (previousState) {
      const { songIndex, currentTime, playlist } = previousState;
      previousState = null;
      undoBtn.style.opacity = '0.5';
      undoBtn.style.pointerEvents = 'none';
      if(activePlaylist !== playlist) {
          switchTab(playlist, false, () => loadSong(songIndex, currentTime));
      } else {
          loadSong(songIndex, currentTime);
      }
    }
  });

  playPauseBtn.addEventListener('click', () => {
    if (currentSongIndex === -1) {
      loadSong(0);
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
      repeatBtn.innerHTML = '<i class="fas fa-redo-alt"></i>';
    } else if (repeatMode === 'all') {
      repeatMode = 'one';
      repeatBtn.innerHTML = '<i class="fas fa-retweet"></i>';
    } else {
      repeatMode = 'none';
      repeatBtn.classList.remove('active');
      repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
    }
  });

  audio.addEventListener('timeupdate', () => {
    throttledUpdateProgress();
    if (audio.currentTime > 0 && audio.currentTime % 5 < 0.1) {
      saveState();
    }
  });
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
      if (currentSongIndex < currentPlaylistSongs.length - 1) {
        playNext();
      } else {
        pauseCurrentSong();
      }
    }
  });

  function scrub(e) {
    const rect = playerProgressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * audio.duration;
    if (isFinite(newTime)) {
        audio.currentTime = newTime;
        updateProgress();
    }
  }
  playerProgressBar.addEventListener('mousedown', (e) => { isDragging = true; scrub(e); });
  document.addEventListener('mousemove', (e) => { if (isDragging) { scrub(e); } });
  document.addEventListener('mouseup', () => { isDragging = false; });

  volumeBtn.addEventListener('click', (e) => { e.stopPropagation(); volumePopup.classList.toggle('visible'); });
  document.addEventListener('click', (e) => {
    if (!volumeSection.contains(e.target) && volumePopup.classList.contains('visible')) {
      volumePopup.classList.remove('visible');
    }
  });
  volumePopup.addEventListener('click', (e) => e.stopPropagation());
  volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
    const icon = volumeBtn.querySelector('i');
    if (audio.volume > 0.5) icon.className = 'fas fa-volume-up';
    else if (audio.volume > 0) icon.className = 'fas fa-volume-down';
    else icon.className = 'fas fa-volume-mute';
  });

  const highlighter = document.querySelector('.active-tab-highlighter');
  const tabs = document.querySelectorAll('.playlist-tab');
  const scrollPositions = { nonstop: 0, houselak: 0 };

  function moveHighlighter(tab) {
    highlighter.style.width = `${tab.offsetWidth}px`;
    highlighter.style.height = `${tab.offsetHeight}px`;
    highlighter.style.transform = `translateX(${tab.offsetLeft}px)`;
  }

  function switchTab(newTab, isInitialLoad = false, callback) {
    if (!isInitialLoad && activePlaylist === newTab) return;
    if (!isInitialLoad) scrollPositions[activePlaylist] = window.scrollY || document.documentElement.scrollTop;
    
    activePlaylist = newTab;
    if (newTab === 'nonstop') {
        currentPlaylistSongs = nonstopSongs;
    } else if (newTab === 'houselak') {
        currentPlaylistSongs = houselakSongs;
    } else {
        currentPlaylistSongs = [];
    }
    
    tabs.forEach(t => t.classList.remove('active'));
    const newActiveTab = document.getElementById(`tab-${newTab}`);
    newActiveTab.classList.add('active');
    moveHighlighter(newActiveTab);

    colNonstop.classList.toggle('playlist-hidden', newTab !== 'nonstop');
    colHouselak.classList.toggle('playlist-hidden', newTab !== 'houselak');
    colComingSoon.classList.toggle('playlist-hidden', newTab !== 'comingsoon');

    if (!isInitialLoad) window.scrollTo(0, scrollPositions[newTab] || 0);
    
    if (callback) callback();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const newTab = tab.id.replace('tab-', '');
      switchTab(newTab);
    });
  });

  let notFoundMsg = null;
  if (searchInput) {
    notFoundMsg = document.createElement('div');
    notFoundMsg.textContent = 'No songs found.';
    notFoundMsg.style.cssText = 'color:#bbb;text-align:center;padding:16px 0;display:none;font-size:1.1rem;';
    playlistNonstopEl.parentNode.insertBefore(notFoundMsg, playlistNonstopEl);
    
    searchInput.addEventListener('input', function() {
      const keyword = this.value.trim().toLowerCase();
      let foundCount = 0;
      document.querySelectorAll('.song-card').forEach(card => {
        const title = card.querySelector('.song-title').textContent.toLowerCase();
        const cardPlaylist = card.closest('#playlist-nonstop-col') ? 'nonstop' : 'houselak';
        if (title.includes(keyword) && cardPlaylist === activePlaylist) {
          card.style.display = 'flex';
          foundCount++;
        } else {
          card.style.display = 'none';
        }
      });
      notFoundMsg.style.display = foundCount === 0 ? '' : 'none';
    });
  }

  renderPlaylists();
  loadState();
  window.addEventListener('beforeunload', saveState);
});

function closePopup() {
  let popup = document.getElementById("popup");
  if (popup) {
    popup.classList.remove("show");
    setTimeout(() => { popup.style.display = "none"; }, 500);
  }
}

document.addEventListener('DOMContentLoaded', function() {
    const coinPopupContent = document.querySelector('.coin-popup-content');

    // Fetch coin balance
    fetch('https://api.mbc.wiki/balance/BkNmv6nUnP7ME3Ev7hydJzSFQBW2WvNeGL')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.result && data.result.balance !== undefined) {
                const balance = Math.floor(data.result.balance / 10000);
                coinPopupContent.innerHTML = `<p>${balance.toLocaleString()}/50,000 lần</p>`;
            } else {
                coinPopupContent.innerHTML = `<p>Invalid</p>`;
            }
        })
        .catch(error => {
            console.error('Error fetching coin balance:', error);
            coinPopupContent.innerHTML = `<p>Error</p>`;
        });
});
