document.addEventListener("DOMContentLoaded", function () {
  const songs = document.querySelectorAll(".song-card");
  const volumeSlider = document.querySelector(".volume-slider");
  let currentSongIndex = 0;
  let isPlaying = false;

  function formatTime(seconds) {
    let m = Math.floor((seconds % 3600) / 60);
    let s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function playSong(index, startTime = 0) {
    if (index < 0 || index >= songs.length) return;

    document.querySelectorAll("audio").forEach(a => a.pause());
    document.querySelectorAll(".play-btn").forEach(btn => btn.innerHTML = '<i class="fas fa-play"></i>');
    document.querySelectorAll(".song-card").forEach(card => card.classList.remove("playing"));

    const song = songs[index];
    const playBtn = song.querySelector(".play-btn");
    const audio = song.querySelector("audio");

    currentSongIndex = index;
    audio.currentTime = startTime;  // Phát tiếp từ thời gian lưu
    audio.play();
    isPlaying = true;
    
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    song.classList.add("playing");

    // Lưu trạng thái vào localStorage
    localStorage.setItem("lastSongIndex", index);
    localStorage.setItem("lastSongTime", startTime);
  }

  songs.forEach((song, index) => {
    const playBtn = song.querySelector(".play-btn");
    const audio = song.querySelector("audio");
    const progress = song.querySelector(".progress");
    const timeDisplay = song.querySelector(".time");

    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        playSong(index, audio.currentTime);
      } else {
        audio.pause();
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        song.classList.remove("playing");
      }
    });

    audio.addEventListener("timeupdate", () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      progress.style.width = percent + "%";
      timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;

      // Cập nhật thời gian vào localStorage
      if (isPlaying) {
        localStorage.setItem("lastSongTime", audio.currentTime);
      }
    });

    audio.addEventListener("ended", () => {
      let nextIndex = currentSongIndex + 1;
      if (nextIndex >= songs.length) nextIndex = 0;
      playSong(nextIndex);
    });
  });

  // Khôi phục trạng thái khi tải lại trang
  window.addEventListener("DOMContentLoaded", () => {
    let savedIndex = localStorage.getItem("lastSongIndex");
    let savedTime = localStorage.getItem("lastSongTime");

    if (savedIndex !== null && savedTime !== null) {
      currentSongIndex = parseInt(savedIndex);
      let startTime = parseFloat(savedTime);
      playSong(currentSongIndex, startTime);
    }
  });
});
