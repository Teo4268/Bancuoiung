async function getUpdatedAudioURL(originalURL) {
    try {
        // Kiểm tra xem URL hiện tại còn hoạt động không
        const response = await fetch(originalURL, { method: "HEAD" });
        if (response.ok) {
            return originalURL; // URL vẫn còn hợp lệ
        } else {
            throw new Error("URL expired, fetching new URL...");
        }
    } catch (error) {
        console.warn("Fetching new URL due to expired link...");

        // Tự động lấy dataset từ URL cũ
        const urlParts = originalURL.split("/");
        const datasetIndex = urlParts.findIndex(part => part === "datasets") + 1;
        if (datasetIndex <= 0 || datasetIndex >= urlParts.length) {
            console.error("Không xác định được dataset từ URL:", originalURL);
            return originalURL; // Trả về URL cũ nếu không lấy được dataset
        }

        const datasetName = urlParts[datasetIndex]; // Lấy tên dataset
        const fileName = urlParts.pop(); // Lấy tên file nhạc
        const baseURL = `https://huggingface.co/datasets/${datasetName}/resolve/main/`;

        return baseURL + fileName;
    }
}

async function handleAudioError(audioElement) {
    const currentSrc = audioElement.src;
    const newSrc = await getUpdatedAudioURL(currentSrc);

    if (newSrc !== currentSrc) {
        audioElement.src = newSrc;
        audioElement.load();  // Tải lại nhạc
        audioElement.play().catch(console.error); // Tiếp tục phát
    }
}

// Khi trang tải xong, kiểm tra tất cả thẻ <audio>
document.addEventListener("DOMContentLoaded", function () {
    const audioElements = document.querySelectorAll("audio");

    audioElements.forEach(audio => {
        audio.addEventListener("error", () => handleAudioError(audio));
    });
});
