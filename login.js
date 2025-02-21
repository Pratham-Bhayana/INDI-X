document.addEventListener("DOMContentLoaded", function () {
  // Show Signup Form
  const showSignupBtn = document.getElementById("show-signup");
  const showLoginBtn = document.getElementById("show-login");
  const loginForm = document.getElementById("login");
  const signupForm = document.getElementById("signup");

  showSignupBtn.addEventListener("click", () => {
      loginForm.classList.remove("active");
      signupForm.classList.add("active");
  });

  showLoginBtn.addEventListener("click", () => {
      signupForm.classList.remove("active");
      loginForm.classList.add("active");
  });

  // GSAP Animations for Auth Box
  gsap.from(".auth-box", {
      opacity: 0,
      y: 50,
      duration: 1,
      delay: 0.5,
      ease: "power2.out",
  });

  // Glowing Particles Animation
  const particles = document.querySelectorAll(".particle");

  particles.forEach((particle, index) => {
      gsap.to(particle, {
          x: gsap.utils.random(-500, 500),
          y: gsap.utils.random(-500, 500),
          opacity: gsap.utils.random(0.1, 0.3),
          scale: gsap.utils.random(0.5, 2),
          duration: gsap.utils.random(3, 5),
          repeat: -1,
          yoyo: true,
          delay: gsap.utils.random(0, 2),
          ease: "power1.inOut",
      });
  });

  // Background Glow Effect
  gsap.to(".auth-page", {
      background: `linear-gradient(135deg, #000, #0a0a0a, #000)`,
      repeat: -1,
      yoyo: true,
      duration: 5,
      ease: "power1.inOut",
  });
});