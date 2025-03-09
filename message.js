// message.js
import { auth, database, storage } from './firebase.js';

document.addEventListener("DOMContentLoaded", () => {
    const connectOptions = document.getElementById("connect-options");
    const chatContainer = document.getElementById("chat-container");
    const preloader = document.createElement("div"); // Futuristic preloader
    const myIdSpan = document.getElementById("my-id");
    const generateIdBtn = document.getElementById("generate-id-btn");
    const idDisplay = document.getElementById("id-display");
    const connectIdInput = document.getElementById("connect-id");
    const connectBtn = document.getElementById("connect-btn");
    const chatMessages = document.getElementById("chat-messages");
    const mediaDisplay = document.getElementById("media-display");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    const emojiBtn = document.getElementById("emoji-btn");
    const mediaBtn = document.getElementById("media-btn");
    const user1Span = document.getElementById("user1");
    const user2Span = document.getElementById("user2");
    const disconnectSaveBtn = document.createElement("button");
    const disconnectNoSaveBtn = document.createElement("button");
    const connectDifferentBtn = document.createElement("button");
    const mediaPreviewModal = document.createElement("div");
    const mediaPreviewContent = document.createElement("div");
    const mediaPreviewImg = document.createElement("img");
    const mediaPreviewVideo = document.createElement("video");
    const sendMediaBtn = document.createElement("button");
    const cancelMediaBtn = document.createElement("button");

    let currentUserId = null;
    let currentUsername = null;
    let currentNumericId = null;
    let connectedUserId = null;
    let connectedUsername = null;
    let connectedNumericId = null;
    let chatRef = null;
    let connectionListener = null;
    let lastConnectedUsername = null;
    let selectedMediaFile = null;

    if (!generateIdBtn || !myIdSpan || !idDisplay || !connectBtn || !connectIdInput || !mediaDisplay) {
        console.error("Required elements not found");
        return;
    }

    // Setup preloader
    preloader.id = "preloader";
    preloader.className = "preloader";
    preloader.innerHTML = `
        <div class="loader">
            <span class="digit">0</span>
            <span class="digit">1</span>
            <span class="digit">0</span>
            <div class="progress-bar"></div>
        </div>
    `;
    document.body.appendChild(preloader);

    // Setup buttons
    disconnectSaveBtn.textContent = "Disconnect & Save";
    disconnectSaveBtn.id = "disconnect-save-btn";
    disconnectSaveBtn.className = "chat-btn";
    disconnectNoSaveBtn.textContent = "Disconnect";
    disconnectNoSaveBtn.id = "disconnect-no-save-btn";
    disconnectNoSaveBtn.className = "chat-btn";
    connectDifferentBtn.textContent = "Connect to Different User";
    connectDifferentBtn.id = "connect-different-btn";
    connectDifferentBtn.className = "chat-btn";

    // Setup media preview modal
    mediaPreviewModal.id = "media-preview-modal";
    mediaPreviewModal.className = "media-preview-modal";
    mediaPreviewContent.className = "media-preview-content";
    mediaPreviewImg.id = "media-preview-img";
    mediaPreviewVideo.id = "media-preview-video";
    mediaPreviewVideo.controls = true;
    sendMediaBtn.textContent = "Send";
    sendMediaBtn.className = "preview-btn send";
    cancelMediaBtn.textContent = "Cancel";
    cancelMediaBtn.className = "preview-btn cancel";
    mediaPreviewContent.appendChild(mediaPreviewImg);
    mediaPreviewContent.appendChild(mediaPreviewVideo);
    mediaPreviewContent.appendChild(sendMediaBtn);
    mediaPreviewContent.appendChild(cancelMediaBtn);
    mediaPreviewModal.appendChild(mediaPreviewContent);
    document.body.appendChild(mediaPreviewModal);

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUserId = user.uid;
            await generateNewNumericId();
            fetchUserData();
            clearChat(); // Clear chats on relogin
        } else {
            window.location.href = "login-signup.html";
        }
    });

    async function generateNewNumericId() {
        let numericId;
        let isUnique = false;
        const usersRef = database.ref('users');

        while (!isUnique) {
            numericId = Math.floor(10000 + Math.random() * 90000);
            const snapshot = await usersRef.orderByChild('numericId').equalTo(numericId).once('value');
            isUnique = !snapshot.exists();
        }
        const userRef = database.ref(`users/${currentUserId}`);
        await userRef.update({ numericId: numericId });
        currentNumericId = numericId;
        displayId(currentNumericId);
    }

    async function fetchUserData() {
        const userRef = database.ref(`users/${currentUserId}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();
        if (userData && userData.username) {
            currentUsername = userData.username;
            if (!currentNumericId) await generateNewNumericId();
            if (!connectedUserId) {
                connectOptions.style.display = "block";
                listenForConnections();
            }
        } else {
            currentUsername = `User_${Math.floor(1000 + Math.random() * 9000)}`;
            await userRef.set({ username: currentUsername });
        }
    }

    function displayId(id) {
        idDisplay.textContent = `Your ID: ${id}`;
        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy";
        copyBtn.className = "copy-btn";
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(id);
            copyBtn.textContent = "Copied!";
            setTimeout(() => copyBtn.textContent = "Copy", 2000);
        });
        idDisplay.appendChild(copyBtn);
    }

    function listenForConnections() {
        const userRef = database.ref(`users/${currentUserId}`);
        connectionListener = userRef.child('connections').on('child_added', async (snapshot) => {
            const connectorId = snapshot.val();
            if (connectorId && connectorId !== currentUserId && !connectedUserId) {
                showPreloader();
                const connectorRef = database.ref(`users/${connectorId}`);
                const connectorSnapshot = await connectorRef.once('value');
                const connectorData = connectorSnapshot.val();
                if (connectorData) {
                    connectedUserId = connectorId;
                    connectedUsername = connectorData.username;
                    connectedNumericId = connectorData.numericId;
                    connectOptions.style.display = "none";
                    chatContainer.style.display = "block";
                    setupChat();
                }
                hidePreloader();
            }
        });

        userRef.child('lastConnectedId').on('value', async (snapshot) => {
            if (snapshot.val() === null && connectedUserId) {
                alert(`The other user (${connectedUsername}) has disconnected.`);
                await handleDisconnect(false, false);
            }
        });
    }

    connectBtn.addEventListener("click", async () => {
        const inputNumericId = connectIdInput.value.trim();
        if (!inputNumericId || !/^\d{5}$/.test(inputNumericId)) {
            alert("Please enter a valid 5-digit ID.");
            return;
        }
        if (parseInt(inputNumericId) === currentNumericId) {
            alert("You cannot connect to yourself.");
            return;
        }

        showPreloader();
        const usersRef = database.ref('users');
        const snapshot = await usersRef.orderByChild('numericId').equalTo(parseInt(inputNumericId)).once('value');
        const userData = snapshot.val();
        if (userData) {
            const connectedUserKey = Object.keys(userData)[0];
            if (connectedUserKey === currentUserId) {
                alert("You cannot connect to yourself.");
                hidePreloader();
                return;
            }
            connectedUserId = connectedUserKey;
            connectedUsername = userData[connectedUserKey].username;
            connectedNumericId = userData[connectedUserKey].numericId;

            const userRef = database.ref(`users/${currentUserId}`);
            const connectedUserRef = database.ref(`users/${connectedUserId}`);
            const connectedUserSnapshot = await connectedUserRef.once('value');
            const connectedUserData = connectedUserSnapshot.val();
            if (connectedUserData.lastConnectedId && connectedUserData.lastConnectedId !== currentUserId) {
                alert("The user is already connected to someone else.");
                hidePreloader();
                return;
            }

            await Promise.all([
                connectedUserRef.child('connections').push(currentUserId),
                userRef.update({ lastConnectedId: connectedUserId }),
                connectedUserRef.update({ lastConnectedId: currentUserId })
            ]);

            connectOptions.style.display = "none";
            chatContainer.style.display = "block";
            setupChat();
        } else {
            alert("User not found with that ID.");
        }
        hidePreloader();
    });

    function setupChat() {
        const chatKey = [currentUserId, connectedUserId].sort().join("-");
        chatRef = database.ref(`chats/${chatKey}`);
        user1Span.textContent = `You: ${currentUsername}`;
        user2Span.textContent = `Connected: ${connectedUsername}`;
        clearChat();
        chatRef.off();
        chatRef.on('child_added', (snapshot) => displayMessage(snapshot.val()));

        const chatInput = document.querySelector(".chat-input");
        if (!chatInput.querySelector("#disconnect-save-btn")) {
            chatInput.appendChild(disconnectSaveBtn);
            chatInput.appendChild(disconnectNoSaveBtn);
            chatInput.appendChild(connectDifferentBtn);
        }
    }

    function clearChat() {
        chatMessages.textContent = "";
        mediaDisplay.textContent = "";
    }

    function displayMessage(message) {
        const isSent = message.sender === currentUserId;
        const senderName = isSent ? currentUsername : connectedUsername;
        const div = document.createElement("div");
        div.className = `message ${isSent ? "sent" : "received"}`;
        if (message.type === "text") {
            div.textContent = `${senderName}: ${message.text}`;
            chatMessages.appendChild(div);
        } else if (message.type === "media") {
            const mediaDiv = document.createElement("div");
            mediaDiv.className = `media-item ${isSent ? "sent" : "received"}`;
            mediaDiv.innerHTML = `${senderName}: <img src="${message.url}" alt="Media" style="max-width: 100%; max-height: 150px; margin-top: 5px;">`;
            mediaDisplay.appendChild(mediaDiv);
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
        mediaDisplay.scrollTop = mediaDisplay.scrollHeight;
    }

    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    function sendMessage() {
        const text = messageInput.value.trim();
        if (text && chatRef) {
            chatRef.push({
                text,
                sender: currentUserId,
                type: "text",
                timestamp: Date.now()
            });
            messageInput.value = "";
        }
    }

    emojiBtn.addEventListener("click", () => {
        if (chatRef) {
            chatRef.push({
                text: "😊",
                sender: currentUserId,
                type: "text",
                timestamp: Date.now()
            });
        }
    });

    mediaBtn.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*,video/*";
        input.onchange = (e) => {
            selectedMediaFile = e.target.files[0];
            if (selectedMediaFile) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    mediaPreviewImg.style.display = "none";
                    mediaPreviewVideo.style.display = "none";
                    if (selectedMediaFile.type.startsWith("image/")) {
                        mediaPreviewImg.src = event.target.result;
                        mediaPreviewImg.style.display = "block";
                    } else if (selectedMediaFile.type.startsWith("video/")) {
                        mediaPreviewVideo.src = event.target.result;
                        mediaPreviewVideo.style.display = "block";
                    }
                    mediaPreviewModal.style.display = "flex";
                };
                reader.readAsDataURL(selectedMediaFile);
            }
        };
        input.click();
    });

    sendMediaBtn.addEventListener("click", async () => {
        if (selectedMediaFile && chatRef) {
            showPreloader();
            try {
                const mediaRef = storage.ref(`media/${currentUserId}/${chatRef.key}/${Date.now()}_${selectedMediaFile.name}`);
                const uploadTask = await mediaRef.put(selectedMediaFile);
                const url = await uploadTask.ref.getDownloadURL();
                await chatRef.push({
                    url,
                    sender: currentUserId,
                    type: "media",
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error("Error uploading media:", error.message);
            }
            closeMediaPreview();
            hidePreloader();
        }
    });

    cancelMediaBtn.addEventListener("click", closeMediaPreview);

    function closeMediaPreview() {
        mediaPreviewModal.style.display = "none";
        selectedMediaFile = null;
        mediaPreviewImg.src = "";
        mediaPreviewVideo.src = "";
    }

    disconnectSaveBtn.addEventListener("click", () => {
        if (chatRef && connectionListener) showDisconnectDialog(true);
    });

    disconnectNoSaveBtn.addEventListener("click", () => {
        if (chatRef && connectionListener) showDisconnectDialog(false);
    });

    connectDifferentBtn.addEventListener("click", async () => {
        if (chatRef && connectionListener) {
            showPreloader();
            await handleDisconnect(false, false);
            connectOptions.style.display = "block";
            chatContainer.style.display = "none";
            hidePreloader();
        }
    });

    window.onbeforeunload = () => {
        if (chatRef && connectionListener) {
            showDisconnectDialog(false);
            return "Are you sure you want to leave?";
        }
    };

    function showDisconnectDialog(isSave) {
        const choice = confirm("Choose an option:\n- OK: Save & Disconnect (Download chat)\n- Cancel: Disconnect without Save (Redirect to login)");
        if (choice) handleDisconnect(isSave, true);
        else handleDisconnect(false, false);
    }

    async function handleDisconnect(isSave, download) {
        showPreloader();
        if (chatRef) chatRef.off();
        const userRef = database.ref(`users/${currentUserId}`);
        const connectedUserRef = database.ref(`users/${connectedUserId}`);
        if (connectionListener) {
            userRef.child('connections').off('child_added', connectionListener);
            connectionListener = null;
        }
        lastConnectedUsername = connectedUsername;
        connectedUserId = null;
        connectedUsername = null;
        connectedNumericId = null;
        chatRef = null;

        if (isSave) {
            await userRef.update({ lastConnectedId: null });
            if (download) downloadChat();
        } else {
            await userRef.update({ lastConnectedId: null });
            await connectedUserRef.update({ lastConnectedId: null });
            await database.ref(`users/${currentUserId}/connections`).remove();
            await database.ref(`users/${connectedUserId}/connections`).remove();
        }
        await auth.signOut();
        alert(`Your last connection with ${lastConnectedUsername} was successfully disconnected.`);
        connectOptions.style.display = "block";
        chatContainer.style.display = "none";
        clearChat();
        hidePreloader();
        if (!isSave) window.location.href = "login-signup.html";
    }

    function downloadChat() {
        const messages = Array.from(chatMessages.children).map(msg => msg.textContent).join("\n");
        const mediaItems = Array.from(mediaDisplay.children).map(item => item.textContent).join("\n");
        const css = `
            body { margin: 0; padding: 40px; background: #1a1a1a; color: #fff; font-family: 'Roboto', sans-serif; }
            .message, .media-item { padding: 10px; border-radius: 5px; margin: 10px 0; max-width: 80%; }
            .sent { background: #00ffcc; color: #000; }
            .received { background: #e0e0e0; color: #000; }
        `;
        const html = `
            <!DOCTYPE html><html><head><style>${css}</style></head><body><div>${messages.split("\n").map(msg => `<div class="message">${msg}</div>`).join("")}${mediaItems.split("\n").map(item => `<div class="media-item">${item}</div>`).join("")}</div></body></html>
        `;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chat_${currentUsername}_${lastConnectedUsername}_${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function showPreloader() {
        preloader.style.display = "flex";
    }

    function hidePreloader() {
        preloader.style.display = "none";
    }
});