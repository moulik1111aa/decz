import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:3002", {
  withCredentials: true,
  extraHeaders: {
    "Access-Control-Allow-Origin": "http://localhost:3000 http://localhost:57886"
  }
});

const Form = () => {
    const [labels, setLabels] = useState([]);
    const [labelInput, setLabelInput] = useState("");
    const [labelFormSubmitted, setLabelFormSubmitted] = useState(false);
    const [printedForm, setPrintedForm] = useState(null); // State for printed form

    // Function to add label
    const handleAddLabel = () => {
        if (labelInput.trim() !== "") {
            setLabels((prevLabels) => [...prevLabels, labelInput.trim()]);
            setLabelInput("");
        }
    };

    // Function to handle label input change
    const handleLabelInputChange = (e) => {
        setLabelInput(e.target.value);
    };

    // Function to delete label
    const handleDeleteLabel = (index) => {
        setLabels((prevLabels) => prevLabels.filter((_, i) => i !== index));
    };

    // Function to handle label form submit
    const handleLabelFormSubmit = (e) => {
        e.preventDefault();
        setLabelFormSubmitted(true);
        handleFormSubmit(labels);
    };

    // Function to handle form submission
    const handleFormSubmit = (formData) => {
        console.log("Form Data:", formData);
        socket.emit("senData", formData); // Emit formData to the server
    };

    // Effect to listen for form data from server
    useEffect(() => {
        socket.on("sendform", (formData) => {
            console.log('Received form data:', formData); // Log received form data

            const formFields = Object.entries(formData).map(([key, value]) => (
                <div key={key}>
                    <label>{key}</label>
                    <input type="text" value={value} readOnly />
                </div>
            ));

            const formComponent = (
                <form>
                    {formFields}
                </form>
            );

            setPrintedForm(formComponent);
        });

        // Clean up function
        return () => {
            socket.off("sendform");
        };
    }, []);

    // JSX for Form component
    return (
        <div>
            {!labelFormSubmitted ? (
                <form onSubmit={handleLabelFormSubmit}>
                    {labels.map((label, index) => (
                        <div key={index}>
                            <label>
                                {"${label}:"}
                                <button type="button" onClick={() => handleDeleteLabel(index)}>
                                    Delete
                                </button>
                            </label>
                        </div>
                    ))}
                    <label>
                        Label:
                        <input
                            type="text"
                            value={labelInput}
                            onChange={handleLabelInputChange}
                        />
                    </label>
                    <button type="button" onClick={handleAddLabel}>
                        Add Label
                    </button>
                    <button type="submit">Done</button>
                </form>
            ) : (
                <div>
                    <h2>Stored Form Data</h2>
                    <pre>{JSON.stringify(labels, null, 2)}</pre>
                </div>
            )}
            {/* Printed form */}
            <div>
                <h1>Printed Form</h1>
                {printedForm}
            </div>
        </div>
    );
};

export default Form;