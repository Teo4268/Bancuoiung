// Lấy danh sách bài hát
const songs = [
    { name: "Nơi Này Có Anh", url: "https://api-nghenhac.onrender.com/uploads/NOI%20NAY%20CO%20ANH%20VAVH.mp3" },
    { name: "Bài hát 2", url: "https://api-nghenhac.onrender.com/uploads/5_6084420717858788255.mp3" },
    { name: "Bài hát 3", url: "./music/song3.mp3" }
];

const songListElement = document.getElementById('songList');
const audioPlayer = document.getElementById('audioPlayer');

// Hiển thị danh sách bài hát
songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.textContent = song.name;
    li.dataset.index = index;

    // Chọn bài hát khi click
    li.addEventListener('click', () => {
        document.querySelectorAll('#songList li').forEach(item => item.classList.remove('active-song'));
        li.classList.add('active-song');
        audioPlayer.src = song.url;
        audioPlayer.play();
    });

    songListElement.appendChild(li);
});

// Phát bài hát tiếp theo khi kết thúc
audioPlayer.addEventListener('ended', () => {
    const currentIndex = songs.findIndex(song => song.url === audioPlayer.src);
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];

    document.querySelectorAll('#songList li').forEach(item => item.classList.remove('active-song'));
    document.querySelector(`#songList li[data-index="${nextIndex}"]`).classList.add('active-song');

    audioPlayer.src = nextSong.url;
    audioPlayer.play();
});
