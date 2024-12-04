// Socket.io connection
const socket = io('http://localhost:3333');

// Chat state
let isChatOpen = false;

// Socket connection handlers
socket.on('connect', () => {
    console.log('Connected to server');
    showStatus('Connected to chat server', 'success');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    showStatus('Disconnected from chat server', 'error');
});

// Chat message handlers
function addChatMessage(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${data.userId === socket.id ? 'ml-auto' : 'mr-auto'} max-w-[80%]`;
    
    messageDiv.innerHTML = `
        <div class="bg-[--bg-card] rounded-lg p-3">
            <p class="text-sm text-gray-400 mb-1">${data.userId === socket.id ? 'You' : 'User ' + data.userId.slice(0, 6)}</p>
            <p class="text-white">${data.message}</p>
            <p class="text-xs text-gray-500 mt-1">${new Date(data.timestamp).toLocaleTimeString()}</p>
        </div>
    `;
    
    document.getElementById('chat-messages').appendChild(messageDiv);
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
}

// Chat UI handlers
function toggleChat() {
    isChatOpen = !isChatOpen;
    document.getElementById('chat-overlay').classList.toggle('translate-x-full');
}

function closeChat() {
    isChatOpen = false;
    document.getElementById('chat-overlay').classList.add('translate-x-full');
}

function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    if (message) {
        socket.emit('send-message', message);
        chatInput.value = '';
    }
}

// Media playback handlers
function emitPlay(mediaId) {
    socket.emit('play', mediaId);
}

function emitPause(mediaId) {
    socket.emit('pause', mediaId);
}

function emitLike(mediaId) {
    socket.emit('like-media', mediaId);
}

function emitShare(mediaId) {
    socket.emit('share-media', mediaId);
}

// Socket event listeners
socket.on('new-message', addChatMessage);

socket.on('media-played', (data) => {
    showStatus(`User ${data.userId.slice(0, 6)} is playing this media`);
});

socket.on('media-paused', (data) => {
    showStatus(`User ${data.userId.slice(0, 6)} paused this media`);
});

socket.on('media-liked', (data) => {
    showStatus(`User ${data.userId.slice(0, 6)} liked this media`);
});

socket.on('media-shared', (data) => {
    showStatus(`User ${data.userId.slice(0, 6)} shared this media`);
});

// Export functions for use in main script
window.socketClient = {
    toggleChat,
    closeChat,
    sendMessage,
    emitPlay,
    emitPause,
    emitLike,
    emitShare
};
