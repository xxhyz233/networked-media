// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.parallax-section');
    const sectionContents = document.querySelectorAll('.section-content');
    const squares = document.querySelectorAll('.square');
    const progressItems = document.querySelectorAll('.progress-item');

    // Initialize animations for each section
    sectionContents.forEach((content, index) => {
        // Parallax effect on background
        gsap.to(sections[index], {
            scrollTrigger: {
                trigger: sections[index],
                start: 'top center',
                end: 'bottom center',
                scrub: 1,
                markers: false
            },
            backgroundPosition: '50% 100%',
            ease: 'none'
        });

        // Staggered fade-in and slide-up for text content
        const h1 = content.querySelector('h1');
        const h2 = content.querySelector('h2');
        const paragraphs = content.querySelectorAll('p:not(.quote-text)');
        const squareContainer = content.querySelector('.square-container');
        const quoteText = content.querySelector('.quote-text');

        // Create timeline for content animations
        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: content,
                start: 'top 80%',
                end: 'top 20%',
                scrub: false,
                markers: false
            }
        });

        if (h2) {
            timeline.from(h2, {
                opacity: 0,
                y: 30,
                duration: 0.8
            }, 0);
        }

        if (h1) {
            timeline.from(h1, {
                opacity: 0,
                y: 30,
                duration: 0.8
            }, 0.1);
        }

        paragraphs.forEach((para, i) => {
            timeline.from(para, {
                opacity: 0,
                y: 20,
                duration: 0.6
            }, 0.2 + i * 0.1);
        });

        if (squareContainer) {
            timeline.from(squareContainer, {
                opacity: 0,
                scale: 0.8,
                duration: 0.6
            }, 0.4);
        }

        if (quoteText) {
            timeline.from(quoteText, {
                opacity: 0,
                y: 20,
                duration: 0.6
            }, 0.5);
        }
    });

    // Animate squares with rotation and scale on scroll
    squares.forEach((square, index) => {
        gsap.to(square, {
            scrollTrigger: {
                trigger: square,
                start: 'top center',
                end: 'bottom center',
                scrub: 0.5,
                markers: false
            },
            rotation: 360,
            scale: 1.1,
            ease: 'none'
        });
    });

    // Progress bar: fade in from the left on load
    gsap.from('.progress-bar', {
        opacity: 0,
        x: -16,
        duration: 1,
        delay: 0.4,
        ease: 'power2.out'
    });

    // Join section — form and submissions animations
    const joinSection = document.querySelector('.join-section');
    if (joinSection) {
        const formTl = gsap.timeline({
            scrollTrigger: {
                trigger: joinSection,
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });

        formTl
            .from('.form-row', { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out' }, 0)
            .from('.join-form textarea', { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out' }, 0.15)
            .from('.join-form button', { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out' }, 0.3);

        // Submission items stagger in below the form
        const submissionItems = document.querySelectorAll('.submission-item');
        if (submissionItems.length > 0) {
            gsap.from(submissionItems, {
                scrollTrigger: {
                    trigger: '.submissions',
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 20,
                duration: 0.45,
                stagger: 0.08,
                ease: 'power2.out'
            });
        }
    }

    // Progress bar: use GSAP ScrollTrigger so it works with any scroll container
    function setActive(index) {
        progressItems.forEach((item, i) => item.classList.toggle('active', i === index));
    }

    sections.forEach((section, index) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',    // section top reaches viewport top
            end: 'bottom top',   // section bottom leaves viewport top
            onEnter: () => setActive(index),
            onEnterBack: () => setActive(index),
        });
    });

    // Set initial active state based on current scroll position
    ScrollTrigger.refresh();

    // Click to jump to section
    progressItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            sections[index].scrollIntoView({ behavior: 'smooth' });
        });
    });
});

