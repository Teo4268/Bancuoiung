const sources = [
  "https://shy-hall-3142.mamacooks0010.workers.dev/playlist.json"
];

async function loadAllPlaylists() {
  const container = document.getElementById("playlist");
  container.innerHTML = "";
  const allSongs = [];

  for (let url of sources) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const songs = await res.json();
        const base = url.replace("/playlist.json", "");
        songs.forEach(song => {
          allSongs.push({
            name: song,
            url: `${base}/${encodeURIComponent(song)}`
          });
        });
      }
    } catch (e) {
      console.error("Lỗi khi tải", url);
    }
  }

  const startIndex = 28;

  allSongs.forEach((song, index) => {
    const div = document.createElement("div");
    div.className = "song-card";

    div.innerHTML = `
      <div class="flex-1">
        <h2 class="text-lg font-bold truncate">NST #${startIndex + index}</h2>
        <div class="progress-bar"><div class="progress"></div></div>
        <span class="time">00:00 / 00:00</span>
      </div>
      <button class="play-btn"><i class="fas fa-play"></i></button>
      <audio>
        <source src="${song.url}" type="audio/mpeg">
      </audio>
    `;

    container.appendChild(div);

    const audio = div.querySelector("audio");
    const playBtn = div.querySelector(".play-btn");
    const progressBar = div.querySelector(".progress");
    const time = div.querySelector(".time");
    const icon = playBtn.querySelector("i");

    playBtn.addEventListener("click", () => {
      const isPlaying = !audio.paused;
      document.querySelectorAll("audio").forEach(a => {
        if (a !== audio) a.pause();
      });

      if (isPlaying) {
        audio.pause();
        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
      } else {
        audio.play();
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
      }
    });

    audio.addEventListener("timeupdate", () => {
      const current = audio.currentTime;
      const total = audio.duration;
      if (!isNaN(total)) {
        const percent = (current / total) * 100;
        progressBar.style.width = percent + "%";
        time.textContent = formatTime(current) + " / " + formatTime(total);
      }
    });

    audio.addEventListener("ended", () => {
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    });
  });
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

document.addEventListener("DOMContentLoaded", loadAllPlaylists);
