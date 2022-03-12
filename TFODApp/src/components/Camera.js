import React from 'react'
import "./Camera.css"
import ReactiveButton from 'reactive-button';
import axios from "axios";

function Camera(props) {
    return (props.trigger) ? (
        <div className="camera">
            <div className="camera-inner">
              
               
                {props.children}
            </div>
        </div>
    ) : "";

}

export default Camera

