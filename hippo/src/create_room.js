import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ResponseForm from './form_creation';
import "./App.css"

const socket = io.connect("http://localhost:3002", {
    withCredentials: true,
    extraHeaders: {
        "Access-Control-Allow-Origin": "http://localhost:3000 http://localhost:57886"
    }
});

const CreateRoom = () => {
    const [press, setPress] = useState(false);
    const [value, setValue] = useState('');
    const [push, setPush] = useState(false);
    const [responseData, setResponseData] = useState(null);

    useEffect(() => {
        // Generate random code when component mounts
        const generateSixDigitCode = () => {
            const randomNumber = Math.floor(Math.random() * 900000) + 100000;
            setValue(randomNumber.toString()); // Convert to string before setting
        };
        generateSixDigitCode();
    }, []); // Empty dependency array ensures this runs only once

    useEffect(() => {
        if (push) {
            socket.on('formDataResponse', (responseData) => {
                console.log('Data received from server:', responseData);
                setResponseData(responseData);
            });

            return () => {
                socket.off('formDataResponse');
            };
        }
    }, [push]);

    const DynamicForm = () => {
        const [fields, setFields] = useState([]);
        const [formData, setFormData] = useState({});

        const addField = () => {
            const newFields = [...fields, { id: Date.now() }];
            setFields(newFields);
        };

        const removeField = (id) => {
            const updatedFields = fields.filter((field) => field.id !== id);
            setFields(updatedFields);
        };

        const handleChange = (e, id) => {
            const { name, value } = e.target;
            setFormData((prevData) => ({
                ...prevData,
                [id]: {
                    ...prevData[id],
                    [name]: value,
                },
            }));
        };
        if(push){
          return(
            <div>
             {push && responseData && <ResponseForm responseData={responseData} />}
            </div>  
          )
         }

        const handleSubmit = (e) => {
            e.preventDefault();
            console.log('Form Data:', formData);
            // Emit formData only if it's an object
            if (typeof formData === 'object') {
                socket.emit('form', formData);
                setPush(true);
            } else {
                console.error('Invalid formData');
            }
        };

        return (
            <div>
              <form onSubmit={handleSubmit}>
                {fields.map((field) => (
                  <div key={field.id}>
                    <input
                      type="text"
                      name="fieldName"
                      placeholder="Field Name"
                      onChange={(e) => handleChange(e, field.id)}
                    />
          
                    <button
                      type="button"
                      className="modify-buttons" style={{ marginLeft: '15px', marginTop:"20px" }}
                      onClick={() => removeField(field.id)}  >
                      Delete
                      <br></br>
                    </button>
                  </div>
                ))}
                <br></br>
                <button type="button" className="modify-buttons" onClick={addField}>
  Add
</button>

<button type="submit" className="modify-buttons" style={{ marginLeft: '10px' }}>
  Done
</button>

              </form>
            </div>
          );
    };

    const handleClick = () => {
      setPress(true);
      console.log(value)
      socket.emit('room', value);
      socket.emit('message_room',value)
     };

    if(press){
      return(
        <div>
        <DynamicForm/>
        </div>
      )
    }

    return (
<div className="container">
      <div>
        <label>
          <div>
          <br></br><br></br>
              <div className="value-container">
                <h2>Hover below to view the room code</h2> </div>
                <br></br>
            <p class="roomcodetext">
            <span class="actual-text"> Room Code</span>
            <span aria-hidden="true" class="hover-text">{value}</span>
            </p>
          </div>
        </label>
        <button className="button confirm-button" onClick={handleClick}>
          <div>Confirm</div>
        </button>
      </div>
    </div>
)}

export default CreateRoom;