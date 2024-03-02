import React, { useState } from 'react';
import Create_room from "./create_room";
import Join_room from './join_room.js';
import './Moulikcss/button.css';
import './Moulikcss/coolinput.css'
import './Moulikcss/modifybuttons.css';
import './Moulikcss/roomCodeText.css';

const Disposable_Forms = () => {
  const [press, setpress] = useState(false);
  const [press_1, setpress_1] = useState(false);

  if (press || press_1) {
    if (press) {
      return (
        <div>
          <Create_room/>
        </div>
      );
    }
    if (press_1) {
      return (
        <div>
          <Join_room/>
        </div>
      );
    }
  }

  const Handleclick = () => {
    setpress(true);
  };
  
  const Handleclick_1 = () => {
    setpress_1(true);
  };

  return (
    
    <div className="container">



    
      <button className="button" onClick={Handleclick}>
        Create room
      </button>
      <button className="button" onClick={Handleclick_1}>
        Join Room
      </button>


    </div>
    


    
  );
}

export default Disposable_Forms;