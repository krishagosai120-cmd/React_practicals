import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000', {
  autoConnect: false
});

function App() {
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [inputName, setInputName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleHistory = (history) => setMessages(history);

    const handleMessage = (newMessage) => {
      setMessages((previous) => [...previous, newMessage]);
    };

    const handleOnlineUsers = (users) => setOnlineUsers(users);

    const handleJoinError = (errorMessage) => {
      setError(errorMessage);
    };

    socket.on('chat-history', handleHistory);
    socket.on('receive-message', handleMessage);
    socket.on('online-users', handleOnlineUsers);
    socket.on('join-error', handleJoinError);

    return () => {
      socket.off('chat-history', handleHistory);
      socket.off('receive-message', handleMessage);
      socket.off('online-users', handleOnlineUsers);
      socket.off('join-error', handleJoinError);
    };
  }, []);

  const joinChat = (event) => {
    event.preventDefault();

    const name = inputName.trim();

    if (!name) {
      setError('Please enter your name.');
      return;
    }

    setError('');
    setUsername(name);
    setJoined(true);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join-chat', name);
  };

  const sendMessage = (event) => {
    event.preventDefault();

    if (!message.trim()) return;

    socket.emit('send-message', message);
    setMessage('');
  };

  if (!joined) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={joinChat}>
          <div className="chat-icon">💬</div>
          <h1>ConnectHub</h1>
          <p>Real-time messaging made simple.</p>

          <label htmlFor="username">Your Name</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={inputName}
            onChange={(event) => setInputName(event.target.value)}
            maxLength={30}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit">Join Chat</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">💬</span>
          <div>
            <h2>ConnectHub</h2>
            <p>Real-Time Chat Application</p>
          </div>
        </div>

        <div className="user-badge">
          <span className="status-dot"></span>
          {username}
        </div>
      </header>

      <main className="chat-layout">
        <aside className="sidebar">
          <h3>Online Users</h3>
          <p className="online-count">
            {onlineUsers.length} user(s) online
          </p>

          {onlineUsers.map((user, index) => (
            <div className="user-item" key={`${user}-${index}`}>
              <span className="avatar">
                {user.charAt(0).toUpperCase()}
              </span>
              <span>{user}</span>
              <span className="status-dot"></span>
            </div>
          ))}
        </aside>

        <section className="chat-panel">
          <div className="chat-heading">
            <h3>General Chat</h3>
            <span>Messages appear in real time</span>
          </div>

          <div className="messages">
            {messages.map((item, index) => (
              <div
                key={`${index}-${item.time}`}
                className={
                  item.type === 'system'
                    ? 'system-message'
                    : item.username === username
                    ? 'message own-message'
                    : 'message'
                }
              >
                {item.type === 'system' ? (
                  <p>{item.message}</p>
                ) : (
                  <>
                    <div className="message-info">
                      <strong>
                        {item.username === username
                          ? 'You'
                          : item.username}
                      </strong>
                      <span>{item.time}</span>
                    </div>
                    <p>{item.message}</p>
                  </>
                )}
              </div>
            ))}
          </div>

          <form className="message-form" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={1000}
            />
            <button type="submit">Send ➤</button>
          </form>
        </section>
      </main>

      <footer className="footer">
        ConnectHub · Built with React, Node.js and Socket.IO
      </footer>
    </div>
  );
}

export default App;