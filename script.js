document.addEventListener("DOMContentLoaded", function () {
  const songs = document.querySelectorAll(".song-card");
  const volumeSlider = document.querySelector(".volume-slider");
  let currentSongIndex = 0; // Lưu vị trí bài hát hiện tại

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
    if (index < 0 || index >= songs.length) return;

    // Dừng tất cả bài hát trước khi phát bài mới
    document.querySelectorAll("audio").forEach(a => a.pause());
    document.querySelectorAll(".play-btn").forEach(btn => btn.innerHTML = '<i class="fas fa-play"></i>');
    document.querySelectorAll(".song-card").forEach(card => card.classList.remove("playing"));

    // Lấy phần tử bài hát
    const song = songs[index];
    const playBtn = song.querySelector(".play-btn");
    const audio = song.querySelector("audio");

    // Cập nhật trạng thái phát
    currentSongIndex = index;
    audio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    song.classList.add("playing");
  }

  songs.forEach((song, index) => {
    const playBtn = song.querySelector(".play-btn");
    const audio = song.querySelector("audio");
    const progressBar = song.querySelector(".progress-bar");
    const progress = song.querySelector(".progress");
    const timeDisplay = song.querySelector(".time");

    // Cập nhật tổng thời gian khi tải xong metadata
    function updateTotalDuration() {
      if (!isNaN(audio.duration)) {
        timeDisplay.textContent = `00:00 / ${formatTime(audio.duration)}`;
      }
    }
    audio.addEventListener("loadedmetadata", updateTotalDuration);
    if (audio.readyState >= 1) updateTotalDuration();

    // Xử lý khi nhấn nút play/pause
    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        playSong(index);
      } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        song.classList.remove("playing");
      }
    });

    // Cập nhật thanh tiến trình khi bài hát phát
    audio.addEventListener("timeupdate", () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      progress.style.width = percent + "%";
      timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });

    // Click để tua nhạc
    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * audio.duration;
      audio.currentTime = newTime;
    });

    // Khi bài hát kết thúc, tự động phát bài tiếp theo
    audio.addEventListener("ended", () => {
      let nextIndex = currentSongIndex + 1;
      if (nextIndex >= songs.length) nextIndex = 0; // Nếu hết danh sách thì quay lại bài đầu
      playSong(nextIndex);
    });
  });

  // Điều chỉnh âm lượng với thanh trượt
  volumeSlider.addEventListener("input", (e) => {
    document.querySelectorAll("audio").forEach(a => a.volume = e.target.value);
  });
});

window.addEventListener("beforeunload", () => {
  localStorage.setItem("lastSongIndex", currentSongIndex);
});

window.addEventListener("DOMContentLoaded", () => {
  let savedIndex = localStorage.getItem("lastSongIndex");
  if (savedIndex !== null) {
    currentSongIndex = parseInt(savedIndex);
    playSong(currentSongIndex);
  }
});
