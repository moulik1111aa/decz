import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import CSVConverter from "./csv_file";

const socket = io.connect("http://localhost:3002");

const Print_del = () => {
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        socket.on('dataBase', (document) => {
            console.log("Received document:", document);
            setDocuments((prevDocuments) => [...prevDocuments, document]);
        });

        return () => {
            socket.off('dataBase');
        };
    }, []); // Empty dependency array to ensure useEffect runs only once

    const handleDelete = (documentId) => {
        console.log("Deleting document with ID:", documentId);
        socket.emit("delete_id", documentId);
        setDocuments(documents.filter(doc => doc._id !== documentId));
    };

    return (
        <div>
            {documents.map((document, index) => (
                <div key={index} className="card blue-grey darken-1">
                    <div className="card-content white-text">
                        <p>{JSON.stringify(document)}</p>
                        <button onClick={() => handleDelete(document._id)}>
                            Delete
                        </button>
                    </div>
                    <CSVConverter formData={document} key={index} /> 
                </div>
            ))}
        </div>
    );
};

export default Print_del;