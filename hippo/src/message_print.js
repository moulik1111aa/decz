
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Offcanvas, Button } from 'react-bootstrap';

const socket = io.connect('http://localhost:3002');

const ChatApp = () => {
  const [inputValue, setInputValue] = useState('');
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('chat_message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Clean up event listener on unmount
    return () => {
      socket.off('chat_message');
    };
  }, []);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      // Send the message to the server
      socket.emit('chat_message', inputValue);
      setInputValue('');
    }
  };

  return (
    <div style={{ textAlign: 'right', paddingRight: '20px' }}>
      <Button onClick={() => setShowOffcanvas(true)}>Open Chat</Button>
      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Chat</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Type your message"
              value={inputValue}
              onChange={handleChange}
            />
            <button type="submit">Send</button>
          </form>
          <div>
            {messages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default ChatApp;