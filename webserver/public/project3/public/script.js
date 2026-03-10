(function () {
    const loader = document.getElementById('loader');
    const bar = document.getElementById('loaderBar');

    // Collect every image src used as a CSS background or <img>
    const mediaSrcs = ['media/sun.png'];
    let loaded = 0;
    const total = mediaSrcs.length;

    function setProgress(p) {
        // p: 0.0 – 1.0
        bar.style.width = (p * 100) + '%';
    }

    function onDone() {
        setProgress(1);
        // Remove loading class first so page is visible beneath the loader
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

    function onAssetLoad() {
        loaded++;
        setProgress(loaded / total);
        if (loaded >= total) onDone();
    }

    mediaSrcs.forEach(function (src) {
        const img = new Image();
        img.onload = onAssetLoad;
        img.onerror = onAssetLoad; // count errors too so we never hang
        img.src = src;
    });

    // Fallback: force-complete after 6s regardless
    setTimeout(onDone, 6000);
})();
