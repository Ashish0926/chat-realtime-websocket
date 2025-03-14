let stompClient = null;
const username = document.getElementById('username');
const connectButton = document.getElementById('connect-button');
const disconnectButton = document.getElementById('disconnect-button');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const messageList = document.getElementById('message-list');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

// Connect to WebSocket server
function connect() {
    if (!username.value.trim()) {
        showError("Please enter your name first");
        return;
    }

    const socket = new SockJS('/websocket');
    stompClient = Stomp.over(socket);

    // Disable console logging from STOMP
    stompClient.debug = null;

    stompClient.connect({}, onConnected, onError);

    addSystemMessage("Connecting...");
}

// Handle successful connection
function onConnected() {
    // Subscribe to the public topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Tell everyone you joined
    stompClient.send("/app/chat.join",
        {},
        JSON.stringify({
            sender: username.value,
            type: 'JOIN'
        })
    );

    // Update UI for connected state
    setConnectedState(true);
    addSystemMessage("Connected successfully!");
}

// Handle connection error
function onError(error) {
    console.error('Could not connect to WebSocket server', error);
    addSystemMessage("Failed to connect. Please try again later.");
    setConnectedState(false);
}

// Disconnect from WebSocket server
function disconnect() {
    if (stompClient) {
        // Send leave message before disconnecting
        stompClient.send("/app/chat.leave",
            {},
            JSON.stringify({
                sender: username.value,
                type: 'LEAVE'
            })
        );

        stompClient.disconnect();
        stompClient = null;
    }

    setConnectedState(false);
    addSystemMessage("Disconnected from chat");
}

// Send message
function sendMessage() {
    const messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        const chatMessage = {
            sender: username.value,
            content: messageContent,
            type: 'CHAT',
            time: new Date().toISOString()
        };

        stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
        messageInput.value = '';

        // Auto-scroll to bottom
        messageList.scrollTop = messageList.scrollHeight;
    }
}

// Handle incoming message
function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);

    switch(message.type) {
        case 'JOIN':
            addSystemMessage(`${message.sender} joined the chat`);
            break;

        case 'LEAVE':
            addSystemMessage(`${message.sender} left the chat`);
            break;

        case 'CHAT':
            addChatMessage(message);
            break;
    }

    // Auto-scroll to bottom
    messageList.scrollTop = messageList.scrollHeight;
}

// Add chat message to UI
function addChatMessage(message) {
    const isSelf = message.sender === username.value;

    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isSelf ? 'message-self' : 'message-other');

    const headerElement = document.createElement('div');
    headerElement.classList.add('message-header');

    const senderElement = document.createElement('span');
    senderElement.classList.add('message-sender');
    senderElement.textContent = isSelf ? 'You' : message.sender;

    const timeElement = document.createElement('span');
    timeElement.classList.add('message-time');
    timeElement.textContent = formatTime(new Date(message.time));

    headerElement.appendChild(senderElement);
    headerElement.appendChild(timeElement);

    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content');
    contentElement.textContent = message.content;

    messageElement.appendChild(headerElement);
    messageElement.appendChild(contentElement);

    messageList.appendChild(messageElement);
}

// Add system message to UI
function addSystemMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'message-system');
    messageElement.textContent = text;
    messageList.appendChild(messageElement);
}

// Show error as system message
function showError(text) {
    addSystemMessage(`Error: ${text}`);
}

// Format time to HH:MM
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Update UI based on connection state
function setConnectedState(connected) {
    // Update status indicator
    statusIndicator.className = connected ? 'status-connected' : 'status-disconnected';
    statusText.textContent = connected ? 'Connected' : 'Disconnected';

    // Update buttons
    connectButton.disabled = connected;
    disconnectButton.disabled = !connected;
    sendButton.disabled = !connected;
    messageInput.disabled = !connected;

    // Username can only be changed when disconnected
    username.disabled = connected;

    if (connected) {
        messageInput.focus();
    } else {
        username.focus();
    }
}

// Handle Enter key in message input
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Wire up event listeners
connectButton.addEventListener('click', connect);
disconnectButton.addEventListener('click', disconnect);
sendButton.addEventListener('click', sendMessage);

// Auto-resize textarea as content grows
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight < 120) ? this.scrollHeight + 'px' : '120px';
});

// Initialize UI
setConnectedState(false);
username.focus();