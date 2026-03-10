(function () {
    const loader = document.getElementById('loader');
    const bar = document.getElementById('loaderBar');

    let total = 0;
    let loaded = 0;
    let done = false;

    function setProgress(p) {
        bar.style.width = (Math.min(p, 1) * 100) + '%';
    }

    function onDone() {
        if (done) return;
        done = true;
        setProgress(1);
        document.body.classList.remove('loading');
        setTimeout(function () {
            gsap.to(loader, {
                opacity: 0,
                duration: 1.1,
                ease: 'power2.inOut',
                onComplete: function () {
                    loader.style.display = 'none';
                }
            });
        }, 350);
    }

    function onAssetReady() {
        loaded++;
        setProgress(loaded / total);
        if (loaded >= total) onDone();
    }

    // --- Images (CSS background assets) ---
    const imageSrcs = ['media/sun.png'];

    // --- Videos: pick up every <video> element in the document ---
    const videoEls = Array.from(document.querySelectorAll('video'));

    total = imageSrcs.length + videoEls.length;

    // Track images
    imageSrcs.forEach(function (src) {
        const img = new Image();
        img.onload = onAssetReady;
        img.onerror = onAssetReady;
        img.src = src;
    });

    // Track videos
    videoEls.forEach(function (video) {
        if (video.readyState >= 4) {
            onAssetReady();
        } else {
            video.addEventListener('canplaythrough', onAssetReady, { once: true });
            video.addEventListener('error', onAssetReady, { once: true });
        }
    });

    // Fallback: force transition after 8s 
    setTimeout(onDone, 8000);
})();
