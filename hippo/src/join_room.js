import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ResponseForm from './form_creation';

const socket = io.connect("http://localhost:3002", {
    withCredentials: true,
    extraHeaders: {
        "Access-Control-Allow-Origin": "http://localhost:3000 http://localhost:57886"
    }
});

const JoinRoom = () => {
    const [input, setInput] = useState("");
    const [roomNotFound, setRoomNotFound] = useState(false);
    const [responseData, setResponseData] = useState(null);
    const [push, setPush] = useState(false);

    const handleChange = (e) => {
        setInput(e.target.value);
        setRoomNotFound(false);
    };

    const handleClick = () => {
        socket.emit("room", input);
        setPush(true);
    };

    useEffect(() => {
        if (push) {
            socket.on("user_data", (userData) => {
                console.log("Data for room", input, "received:", userData);
                if (userData.length > 0) {
                    setResponseData(userData[0].data);
                } else {
                    setRoomNotFound(true);
                }
            });

            return () => {
                socket.off("user_data");
            };
        }
    }, [push, input]);

    return (
        <div>
          {push ? (
            <>
              {roomNotFound && <div>ROOM NOT FOUND!!!</div>}
              {responseData && <ResponseForm responseData={responseData} />}
            </>
          ) : (
            <div className="input-container">
              <input
                type="text"
                placeholder="Enter room"
                value={input}
                onChange={handleChange}
                className="input"
              />
      

      <button className="button confirm-button" style={{ marginTop: '90px' }} onClick={handleClick}>
  <div>Enter</div>
</button>

            </div>
          )}
        </div>
      );
      
};

export default JoinRoom;