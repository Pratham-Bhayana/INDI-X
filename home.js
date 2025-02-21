document.addEventListener("DOMContentLoaded", function () {
    // GSAP Animations for Intro Section
    gsap.from("#text-1", {
        opacity: 0, // Starts hidden, fades in
        y: -50,
        duration: 1,
        delay: 0.5,
        ease: "power2.out",
    });

    gsap.from("#text-2", {
        opacity: 0, // Starts hidden, fades in
        y: 50,
        duration: 1,
        delay: 1,
        ease: "power2.out",
    });

    gsap.from("#text-3", {
        opacity: 0, // Starts hidden, fades in
        y: 50,
        duration: 1,
        delay: 1.5,
        ease: "power2.out",
    });

    gsap.from(".start-btn", {
        opacity: 0, // Starts hidden, fades in
        y: 50,
        duration: 1,
        delay: 2,
        ease: "power2.out",
    });

    // Glowing Particles Animation
    const particles = document.querySelectorAll(".particle");

    particles.forEach((particle, index) => {
        gsap.to(particle, {
            x: gsap.utils.random(-500, 500),
            y: gsap.utils.random(-500, 500),
            opacity: gsap.utils.random(0.1, 0.3), // Lower opacity for particles
            scale: gsap.utils.random(0.5, 2),
            duration: gsap.utils.random(3, 5),
            repeat: -1,
            yoyo: true,
            delay: gsap.utils.random(0, 2),
            ease: "power1.inOut",
        });
    });

    // Background Glow Effect
    gsap.to(".intro-page", {
        background: `linear-gradient(135deg, #000, #0a0a0a, #000)`, // Darker gradient
        repeat: -1,
        yoyo: true,
        duration: 5,
        ease: "power1.inOut",
    });
});