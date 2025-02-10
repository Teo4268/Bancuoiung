document.addEventListener("DOMContentLoaded", function () {
  const songs = document.querySelectorAll(".song-card");
  const volumeSlider = document.querySelector(".volume-slider");

  songs.forEach((song) => {
    const playBtn = song.querySelector(".play-btn");
    const audio = song.querySelector("audio");
    const progressBar = song.querySelector(".progress-bar");
    const progress = song.querySelector(".progress");
    const timeDisplay = song.querySelector(".time");

    // Hiển thị tổng thời gian khi nhạc tải xong
    function updateTotalDuration() {
      if (!isNaN(audio.duration)) {
        timeDisplay.textContent = `00:00 / ${formatTime(audio.duration)}`;
      }
    }

    audio.addEventListener("loadedmetadata", updateTotalDuration);
    if (audio.readyState >= 1) updateTotalDuration(); // Hiển thị ngay khi trang load nếu file đã sẵn sàng

    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        document.querySelectorAll("audio").forEach(a => a.pause());
        document.querySelectorAll(".play-btn").forEach(btn => btn.innerHTML = '<i class="fas fa-play"></i>');
        document.querySelectorAll(".song-card").forEach(card => card.classList.remove("playing"));

        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        song.classList.add("playing");
      } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        song.classList.remove("playing");
      }
    });

    audio.addEventListener("timeupdate", () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      progress.style.width = percent + "%";
      let currentTime = formatTime(audio.currentTime);
      let duration = formatTime(audio.duration);
      timeDisplay.textContent = `${currentTime} / ${duration}`;
    });

    // Cho phép click để tua nhạc
    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * audio.duration;
      audio.currentTime = newTime;
    });

    // Format thời gian chuẩn
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
  });

  // Điều chỉnh âm lượng với thanh trượt
  volumeSlider.addEventListener("input", (e) => {
    document.querySelectorAll("audio").forEach(a => a.volume = e.target.value);
  });
});
