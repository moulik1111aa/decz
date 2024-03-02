import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Offcanvas, Button } from 'react-bootstrap';
import Message_Display from './message_display';

const socket = io.connect("http://localhost:3002", {
    withCredentials: true,
    extraHeaders: {
        "Access-Control-Allow-Origin": "http://localhost:3000 http://localhost:57886"
    }
});

const ChatApp = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const HandelEffect=()=>{
    socket.on('chat message', (message_array) => {
        // Filter out empty or undefined messages
        const filteredMessages = message_array.filter(message => message.trim() !== '');
        console.log("message received:", filteredMessages);
        setMessages(filteredMessages);
    });}
    // Event handler for input change
    const handleChange = (e) => {
        setInputValue(e.target.value);
    }
    
    // Event handler for form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() !== '') { // Check if the input value is not empty or whitespace
            socket.emit("message_sending", inputValue); // Emit message to server
            setInputValue(''); // Clear input after sending
        }
    }

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
                    <HandelEffect/>
                    <ul>
                        {messages.map((message, index) => (
                            <li key={index}>{message}</li>
                        ))}
                    </ul>
                    < Message_Display/>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
};

export default ChatApp