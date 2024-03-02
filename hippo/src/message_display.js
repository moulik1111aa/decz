import React, { useState,useEffect} from 'react';
import io from "socket.io-client"


const socket = io.connect("http://localhost:3002",{
  withCredentials: true,
  extraHeaders: {
    "Access-Control-Allow-Origin": "http://localhost:3000 http://localhost:57886"
  }
});

const Message_Display=()=>{
    const[message,setMessage]=useState([])  
    socket.on('chat message', (message_array)=>{
    console.log("message recieved",message_array)
    setMessage(message_array)
  })
    return(
        <div>
        <ul>
        {message}
       </ul>
        </div>
    )
}
export default Message_Display