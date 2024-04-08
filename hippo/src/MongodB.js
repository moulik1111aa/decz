import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

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

    const handleDownloadCSV = async () => {
        try {
            const csvContent = documents.map(document => convertObjectToCSV(document)).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'all_documents.csv');
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading CSV file:', error);
        }
    };

    const convertObjectToCSV = (data) => {
        const headers = Object.keys(data);
        const values = headers.map(header => data[header]);
        return values.join(',');
    };

    return (
        <div>
            <button onClick={handleDownloadCSV}>Download CSV</button>
            {documents.map((document, index) => (
                <div key={index} className="card blue-grey darken-1">
                    <div className="card-content white-text">
                        <p>{JSON.stringify(document)}</p>
                        <button onClick={() => handleDelete(document._id)}>
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Print_del;