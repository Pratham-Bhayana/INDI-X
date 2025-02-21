document.addEventListener("DOMContentLoaded", function () {
    const chatMessages = document.getElementById("chat-messages");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    const emojiBtn = document.getElementById("emoji-btn");
    const fileBtn = document.getElementById("file-btn");
    const quitBtn = document.getElementById("quit-btn");
    const quitModal = document.getElementById("quit-modal");
    const quitWithoutSave = document.getElementById("quit-without-save");
    const saveAndQuit = document.getElementById("save-and-quit");

    // Send Message Function
    sendBtn.addEventListener("click", () => {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, "sent");
            messageInput.value = "";
            simulateReply();
        }
    });

    // Allow pressing "Enter" to send a message
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const message = messageInput.value.trim();
            if (message) {
                addMessage(message, "sent");
                messageInput.value = "";
                simulateReply();
            }
        }
    });

    // Add Message to Chat
    function addMessage(text, type) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", type);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
        animateMessage(messageDiv);
    }

    // Simulate a Reply (for demo purposes)
    function simulateReply() {
        setTimeout(() => {
            addMessage("This is a reply from the other user.", "received");
        }, 1000);
    }

    // Animate Message Pop-up
    function animateMessage(messageDiv) {
        gsap.from(messageDiv, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: "power2.out",
        });
    }

    // Emoji Picker (Demo: Alert for now)
    emojiBtn.addEventListener("click", () => {
        alert("Emoji picker will be added here.");
    });

    // File Picker (Demo: Alert for now)
    fileBtn.addEventListener("click", () => {
        alert("File picker will be added here.");
    });

    // Quit Chat Options
    quitBtn.addEventListener("click", () => {
        gsap.to(quitModal, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            display: "block",
        });
    });

    quitWithoutSave.addEventListener("click", () => {
        alert("Chat quit without saving.");
        gsap.to(quitModal, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: "power2.out",
            display: "none",
        });
    });

    saveAndQuit.addEventListener("click", () => {
        alert("Chat saved and quit.");
        gsap.to(quitModal, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: "power2.out",
            display: "none",
        });
    });

    // Close Modal if clicked outside
    window.addEventListener("click", (event) => {
        if (event.target === quitModal) {
            gsap.to(quitModal, {
                opacity: 0,
                y: -20,
                duration: 0.5,
                ease: "power2.out",
                display: "none",
            });
        }
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
    gsap.to(".message-page", {
        background: `linear-gradient(135deg, #000, #0a0a0a, #000)`,
        repeat: -1,
        yoyo: true,
        duration: 5,
        ease: "power1.inOut",
    });
});