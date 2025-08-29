// 
// 
// class ChatApp {
//     constructor() {
//         this.userId = null;
//         this.token = null;
//         this.sessions = [];
//         this.currentSession = null;
//         this.socket = null;
//         this.isConnected = false;
//         this.backendUrl = 'http://localhost:3001';
//         this.isAgent = false;
//         
//         this.initializeElements();
//         this.bindEvents();
//         this.loadFromStorage();
//     }
//     
//     initializeElements() {
//         // Auth section
//         this.userIdInput = document.getElementById('userId');
//         this.loginBtn = document.getElementById('login-btn');
//         this.logoutBtn = document.getElementById('logout-btn');
//         this.authSection = document.getElementById('auth-section');
//         this.userInfo = document.getElementById('user-info');
//         this.loggedUserSpan = document.getElementById('logged-user');
//         this.connectionStatus = document.getElementById('connection-status');
//         
//         // Session section
//         this.sessionSection = document.getElementById('session-section');
//         this.startSessionBtn = document.getElementById('start-session-btn');
//         this.sessionsList = document.getElementById('sessions-list');
//         this.sessionsContainer = document.getElementById('sessions-container');
//         
//         // Active session
//         this.activeSession = document.getElementById('active-session');
//         this.sessionIdSpan = document.getElementById('session-id');
//         this.agentIdSpan = document.getElementById('agent-id');
//         this.messagesContainer = document.getElementById('messages');
//         this.messageText = document.getElementById('message-text');
//         this.sendBtn = document.getElementById('send-btn');
//         this.endSessionBtn = document.getElementById('end-session-btn');
//     }
//     
//     bindEvents() {
//         this.loginBtn.addEventListener('click', () => this.login());
//         this.logoutBtn.addEventListener('click', () => this.logout());
//         this.startSessionBtn.addEventListener('click', () => this.startSession());
//         this.sendBtn.addEventListener('click', () => this.sendMessage());
//         this.endSessionBtn.addEventListener('click', () => this.endSession());
//         this.messageText.addEventListener('keypress', (e) => {
//             if (e.key === 'Enter') this.sendMessage();
//         });
//     }
//     
//     loadFromStorage() {
//         const savedToken = localStorage.getItem('chatToken');
//         const savedUserId = localStorage.getItem('chatUserId');
//         
//         if (savedToken && savedUserId) {
//             this.token = savedToken;
//             this.userId = savedUserId;
//             this.isAgent = this.userId.startsWith('agent');
//             this.showUserInterface();
//             this.connectSocket();
//         }
//     }
//     
//     saveToStorage() {
//         if (this.token) {
//             localStorage.setItem('chatToken', this.token);
//         }
//         if (this.userId) {
//             localStorage.setItem('chatUserId', this.userId);
//         }
//     }
//     
//     clearStorage() {
//         localStorage.removeItem('chatToken');
//         localStorage.removeItem('chatUserId');
//     }
//     
//     async login() {
//         const userId = this.userIdInput.value.trim();
//         if (!userId) {
//             alert('Please enter a user ID');
//             return;
//         }
//         
//         try {
//             const response = await fetch(`${this.backendUrl}/auth/token`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ userId })
//             });
//             
//             if (!response.ok) {
//                 throw new Error('Failed to login');
//             }
//             
//             const data = await response.json();
//             this.token = data.token;
//             this.userId = data.userId;
//             this.isAgent = this.userId.startsWith('agent');
//             
//             this.showUserInterface();
//             this.connectSocket();
//             this.saveToStorage();
//             
//         } catch (error) {
//             alert('Error logging in: ' + error.message);
//             console.error('Login error:', error);
//         }
//     }
//     
//     logout() {
//         if (this.socket) {
//             this.socket.disconnect();
//         }
//         
//         this.userId = null;
//         this.token = null;
//         this.sessions = [];
//         this.currentSession = null;
//         this.isConnected = false;
//         this.isAgent = false;
//         
//         this.hideUserInterface();
//         this.clearStorage();
//         this.updateConnectionStatus();
//     }
//     
//     showUserInterface() {
//         this.authSection.classList.add('hidden');
//         this.userInfo.classList.remove('hidden');
//         this.sessionSection.classList.remove('hidden');
//         this.loggedUserSpan.textContent = this.userId;
//         
//         // Show appropriate UI based on user type
//         if (this.isAgent) {
//             this.startSessionBtn.classList.add('hidden');
//             document.getElementById('sessions-list').classList.remove('hidden');
//             document.querySelector('#sessions-list h3').textContent = 'Your Assigned Sessions';
//         } else {
//             this.startSessionBtn.classList.remove('hidden');
//         }
//         
//         this.loadSessions();
//     }
//     
//     hideUserInterface() {
//         this.authSection.classList.remove('hidden');
//         this.userInfo.classList.add('hidden');
//         this.sessionSection.classList.add('hidden');
//         this.sessionsList.classList.add('hidden');
//         this.activeSession.classList.add('hidden');
//         this.userIdInput.value = '';
//         this.startSessionBtn.classList.remove('hidden');
//     }
//     
//     updateConnectionStatus() {
//         if (this.isConnected) {
//             this.connectionStatus.textContent = 'Connected';
//             this.connectionStatus.className = 'connection-status connected';
//         } else {
//             this.connectionStatus.textContent = 'Disconnected';
//             this.connectionStatus.className = 'connection-status disconnected';
//         }
//     }
//     
//     connectSocket() {
//         if (typeof io === 'undefined') {
//             alert('Socket.io library not loaded. Please check your internet connection.');
//             console.error('Socket.io is not defined');
//             return;
//         }
//         
//         if (this.socket) {
//             this.socket.disconnect();
//         }
//         
//         try {
//             this.socket = io(this.backendUrl, {
//                 auth: {
//                     token: this.token
//                 },
//                 transports: ['websocket', 'polling']
//             });
//             
//             this.socket.on('connect', () => {
//                 this.isConnected = true;
//                 this.addMessage('System', 'Connected to server', 'system');
//                 console.log('Connected to server');
//                 this.updateConnectionStatus();
//                 
//                 // If agent, request current sessions
//                 if (this.isAgent) {
//                     this.socket.emit('get_agent_sessions');
//                 }
//             });
//             
//             this.socket.on('disconnect', () => {
//                 this.isConnected = false;
//                 this.addMessage('System', 'Disconnected from server', 'system');
//                 console.log('Disconnected from server');
//                 this.updateConnectionStatus();
//             });
//             
//             this.socket.on('new_message', (message) => {
//                 this.displayMessage(message);
//             });
//             
//             this.socket.on('user_joined', (data) => {
//                 const userType = data.isAgent ? 'Agent' : 'User';
//                 this.addMessage('System', `${userType} ${data.userId} joined the session`, 'system');
//             });
//             
//             this.socket.on('agent_joined', (data) => {
//                 this.addMessage('System', `Agent ${data.agentName} joined the session`, 'system');
//                 this.agentIdSpan.textContent = data.agentName;
//             });
//             
//             this.socket.on('session_ended', (data) => {
//                 this.addMessage('System', 'Session has been ended', 'system');
//                 this.resetSession();
//                 this.loadSessions();
//             });
//             
//             this.socket.on('agent_sessions', (sessions) => {
//                 this.sessions = sessions;
//                 this.renderSessionsList();
//             });
//             
//             this.socket.on('error', (data) => {
//                 console.error('Socket error:', data);
//                 alert('Error: ' + data.message);
//             });
//             
//             this.socket.on('connect_error', (error) => {
//                 console.error('Connection error:', error);
//                 this.addMessage('System', 'Connection error: ' + error.message, 'system');
//                 this.isConnected = false;
//                 this.updateConnectionStatus();
//             });
//             
//         } catch (error) {
//             console.error('Error connecting socket:', error);
//             alert('Error connecting to server: ' + error.message);
//         }
//     }
//     
//     async startSession() {
//         try {
//             const response = await fetch(`${this.backendUrl}/session/start`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${this.token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
//             
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error || 'Failed to start session');
//             }
//             
//             const data = await response.json();
//             this.currentSession = {
//                 id: data.sessionId,
//                 agentId: data.agentId,
//                 agentName: data.agentName
//             };
//             
//             this.showActiveSession();
//             
//             // Join the session room via socket
//             if (this.socket) {
//                 this.socket.emit('join_session', {
//                     sessionId: this.currentSession.id
//                 });
//             }
//             
//             // Load previous messages
//             this.loadMessages();
//             
//             // Reload sessions list
//             this.loadSessions();
//             
//         } catch (error) {
//             alert('Error starting session: ' + error.message);
//             console.error('Start session error:', error);
//         }
//     }
//     
//     async loadSessions() {
//         try {
//             const response = await fetch(`${this.backendUrl}/session`, {
//                 headers: {
//                     'Authorization': `Bearer ${this.token}`
//                 }
//             });
//             
//             if (response.ok) {
//                 this.sessions = await response.json();
//                 this.renderSessionsList();
//             } else if (response.status === 404) {
//                 this.sessions = [];
//                 this.renderSessionsList();
//             } else {
//                 throw new Error('Failed to load sessions');
//             }
//         } catch (error) {
//             console.error('Error loading sessions:', error);
//         }
//     }
//     
//     renderSessionsList() {
//         if (this.sessions.length === 0) {
//             this.sessionsList.classList.add('hidden');
//             return;
//         }
//         
//         this.sessionsList.classList.remove('hidden');
//         this.sessionsContainer.innerHTML = '';
//         
//         this.sessions.forEach(session => {
//             const sessionItem = document.createElement('li');
//             sessionItem.className = 'session-item';
//             
//             const statusClass = session.status === 'active' ? 'status-active' : 'status-ended';
//             const statusText = session.status === 'active' ? 'Active' : 'Ended';
//             
//             // Different info for agents vs users
//             let sessionInfo = '';
//             if (this.isAgent) {
//                 sessionInfo = `
//                     <strong>Session:</strong> ${session.id.substring(0, 8)}... 
//                     <strong>User:</strong> ${session.userId}
//                     <strong>Status:</strong> ${statusText}
//                 `;
//             } else {
//                 sessionInfo = `
//                     <strong>Session:</strong> ${session.id.substring(0, 8)}... 
//                     <strong>Agent:</strong> ${session.agentName || session.agentId}
//                     <strong>Status:</strong> ${statusText}
//                 `;
//             }
//             
//             sessionItem.innerHTML = `
//                 <div class="session-info">
//                     <span class="status-indicator ${statusClass}"></span>
//                     ${sessionInfo}
//                 </div>
//                 <div class="session-actions">
//                     ${session.status === 'active' ? `
//                         <button class="join-session-btn" data-session="${session.id}">Join</button>
//                         <button class="end-session-btn" data-session="${session.id}">End</button>
//                     ` : ''}
//                 </div>
//             `;
//             
//             this.sessionsContainer.appendChild(sessionItem);
//         });
//         
//         // Add event listeners to buttons
//         document.querySelectorAll('.join-session-btn').forEach(btn => {
//             btn.addEventListener('click', (e) => {
//                 const sessionId = e.target.dataset.session;
//                 this.joinSession(sessionId);
//             });
//         });
//         
//         document.querySelectorAll('.end-session-btn').forEach(btn => {
//             btn.addEventListener('click', (e) => {
//                 const sessionId = e.target.dataset.session;
//                 this.endSession(sessionId);
//             });
//         });
//     }
//     
//     async joinSession(sessionId) {
//         try {
//             const response = await fetch(`${this.backendUrl}/session/${sessionId}`, {
//                 headers: {
//                     'Authorization': `Bearer ${this.token}`
//                 }
//             });
//             
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error || 'Failed to join session');
//             }
//             
//             const session = await response.json();
//             this.currentSession = {
//                 id: session.id,
//                 agentId: session.agentId,
//                 agentName: session.agentName
//             };
//             
//             this.showActiveSession();
//             
//             // Join the session room via socket
//             if (this.socket) {
//                 this.socket.emit('join_session', {
//                     sessionId: this.currentSession.id
//                 });
//             }
//             
//             // Load previous messages
//             this.loadMessages();
//             
//         } catch (error) {
//             alert('Error joining session: ' + error.message);
//             console.error('Join session error:', error);
//         }
//     }
//     
//     showActiveSession() {
//         this.sessionIdSpan.textContent = this.currentSession.id.substring(0, 8) + '...';
//         
//         if (this.isAgent) {
//             this.agentIdSpan.textContent = 'You are the agent';
//         } else {
//             this.agentIdSpan.textContent = this.currentSession.agentName || this.currentSession.agentId;
//         }
//         
//         this.activeSession.classList.remove('hidden');
//         this.messagesContainer.innerHTML = '';
//     }
//     
//     async loadMessages() {
//         try {
//             const response = await fetch(`${this.backendUrl}/messages/${this.currentSession.id}`, {
//                 headers: {
//                     'Authorization': `Bearer ${this.token}`
//                 }
//             });
//             
//             if (response.ok) {
//                 const messages = await response.json();
//                 messages.forEach(message => this.displayMessage(message));
//             }
//         } catch (error) {
//             console.error('Error loading messages:', error);
//         }
//     }
//     
//     sendMessage() {
//         if (!this.isConnected) {
//             alert('Not connected to server');
//             return;
//         }
//         
//         if (!this.socket) {
//             alert('Socket connection not established');
//             return;
//         }
//         
//         const content = this.messageText.value.trim();
//         if (!content || !this.currentSession) return;
//         
//         this.socket.emit('send_message', {
//             sessionId: this.currentSession.id,
//             content: content
//         });
//         
//         this.messageText.value = '';
//     }
//     
//     displayMessage(message) {
//         const messageEl = document.createElement('div');
//         messageEl.classList.add('message');
//         
//         // Determine message type
//         if (message.senderId === this.userId) {
//             messageEl.classList.add('user');
//         } else if (message.senderId.startsWith('agent')) {
//             messageEl.classList.add('agent');
//         } else {
//             messageEl.classList.add('other-user');
//         }
//         
//         const time = new Date(message.timestamp).toLocaleTimeString();
//         const senderName = message.senderId.startsWith('agent') ? 
//                           `Agent ${message.senderId.replace('agent', '')}` : 
//                           message.senderId;
//         
//         messageEl.innerHTML = `
//             <div class="message-info">${senderName} at ${time}</div>
//             <div class="message-content">${message.content}</div>
//         `;
//         
//         this.messagesContainer.appendChild(messageEl);
//         this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
//     }
//     
//     addMessage(sender, content, type = 'system') {
//         const messageEl = document.createElement('div');
//         messageEl.classList.add('message');
//         messageEl.classList.add(type);
//         
//         const time = new Date().toLocaleTimeString();
//         messageEl.innerHTML = `
//             <div class="message-info">${sender}</div>
//             <div class="message-content">${content}</div>
//         `;
//         
//         this.messagesContainer.appendChild(messageEl);
//         this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
//     }
//     
//     async endSession(sessionId = null) {
//         const targetSessionId = sessionId || this.currentSession?.id;
//         if (!targetSessionId) return;
//         
//         try {
//             const response = await fetch(`${this.backendUrl}/session/${targetSessionId}/end`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${this.token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
//             
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error || 'Failed to end session');
//             }
//             
//             if (!sessionId) {
//                 // If ending the current session
//                 if (this.socket) {
//                     this.socket.emit('end_session', {
//                         sessionId: targetSessionId
//                     });
//                 }
//                 
//                 this.resetSession();
//             }
//             
//             // Reload sessions list
//             this.loadSessions();
//             
//         } catch (error) {
//             alert('Error ending session: ' + error.message);
//             console.error('End session error:', error);
//         }
//     }
//     
//     resetSession() {
//         this.currentSession = null;
//         this.sessionIdSpan.textContent = '';
//         this.agentIdSpan.textContent = '';
//         this.messagesContainer.innerHTML = '';
//         this.activeSession.classList.add('hidden');
//     }
// }
// 
// // Initialize the app when the page loads
// document.addEventListener('DOMContentLoaded', () => {
//     new ChatApp();
// });