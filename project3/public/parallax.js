gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.parallax-section');
    const sectionContents = document.querySelectorAll('.section-content');
    const squares = document.querySelectorAll('.square');
    const progressItems = document.querySelectorAll('.progress-item');

    sectionContents.forEach((content, index) => {
        gsap.to(sections[index], {
            scrollTrigger: {
                trigger: sections[index],
                start: 'top center',
                end: 'bottom center',
                scrub: 1
            },
            backgroundPosition: '50% 100%',
            ease: 'none'
        });

        const h1 = content.querySelector('h1');
        const h2 = content.querySelector('h2');
        const paragraphs = content.querySelectorAll('p:not(.quote-text)');
        const squareContainer = content.querySelector('.square-container');
        const quoteText = content.querySelector('.quote-text');

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: content,
                start: 'top 80%',
                end: 'top 20%'
            }
        });

        if (h2) timeline.from(h2, { opacity: 0, y: 30, duration: 0.8 }, 0);
        if (h1) timeline.from(h1, { opacity: 0, y: 30, duration: 0.8 }, 0.1);

        paragraphs.forEach((para, i) => {
            timeline.from(para, { opacity: 0, y: 20, duration: 0.6 }, 0.2 + i * 0.1);
        });

        if (squareContainer) timeline.from(squareContainer, { opacity: 0, scale: 0.8, duration: 0.6 }, 0.4);
        if (quoteText) timeline.from(quoteText, { opacity: 0, y: 20, duration: 0.6 }, 0.5);
    });

    squares.forEach(square => {
        gsap.to(square, {
            scrollTrigger: {
                trigger: square,
                start: 'top center',
                end: 'bottom center',
                scrub: 0.5
            },
            rotation: 360,
            scale: 1.1,
            ease: 'none'
        });
    });

    gsap.from('.progress-bar', {
        opacity: 0,
        x: -16,
        duration: 1,
        delay: 0.4,
        ease: 'power2.out'
    });

    const joinSection = document.querySelector('.join-section');
    if (joinSection) {
        gsap.timeline({
            scrollTrigger: { trigger: joinSection, start: 'top 75%', toggleActions: 'play none none none' }
        })
        .from('.form-row', { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out' }, 0)
        .from('.join-form textarea', { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out' }, 0.15)
        .from('.join-form button', { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out' }, 0.3);

        const submissionItems = document.querySelectorAll('.submission-item');
        if (submissionItems.length > 0) {
            gsap.from(submissionItems, {
                scrollTrigger: { trigger: '.submissions', start: 'top 90%', toggleActions: 'play none none none' },
                opacity: 0,
                y: 20,
                duration: 0.45,
                stagger: 0.08,
                ease: 'power2.out'
            });
        }
    }

    function setActive(index) {
        progressItems.forEach((item, i) => item.classList.toggle('active', i === index));
    }

    sections.forEach((section, index) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            onEnter: () => setActive(index),
            onEnterBack: () => setActive(index)
        });
    });

    ScrollTrigger.refresh();

    progressItems.forEach((item, index) => {
        item.addEventListener('click', () => sections[index].scrollIntoView({ behavior: 'smooth' }));
    });
});

