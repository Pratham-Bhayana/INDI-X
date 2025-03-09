// login.js
import { auth } from './firebase.js';

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login");
    const signupForm = document.getElementById("signup");
    const showSignupBtn = document.getElementById("show-signup");
    const showLoginBtn = document.getElementById("show-login");

    if (!loginForm || !signupForm || !showSignupBtn || !showLoginBtn) {
        return;
    }

    loginForm.classList.add("active");
    signupForm.classList.remove("active");

    showSignupBtn.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.classList.remove("active");
        signupForm.classList.add("active");
    });

    showLoginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        signupForm.classList.remove("active");
        loginForm.classList.add("active");
    });

    loginForm.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                window.location.href = "message.html";
            })
            .catch((error) => {
                alert("Login failed: " + error.message);
            });
    });

    signupForm.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();

        if (!email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                window.location.href = "message.html";
            })
            .catch((error) => {
                alert("Signup failed: " + error.message);
            });
    });

    gsap.from(".auth-box", { opacity: 0, y: 50, duration: 1, ease: "power2.out" });
    gsap.to(".particle", {
        x: "random(-500, 500)",
        y: "random(-500, 500)",
        scale: "random(0.5, 2)",
        duration: "random(3, 5)",
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
    });
});