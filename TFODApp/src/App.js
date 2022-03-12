import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities"; 
import Popup from './components/Popup';
import Sound from './audio/sound.mp3';
import { Howl, Howler } from "howler";
import logo from "./images/logo.png";
import pozaAlin from "./images/pozaAlin.jpg";
import { SocialIcon } from 'react-social-icons';
import ReactiveButton from 'reactive-button';
import Camera from "./components/Camera";
import axios from "axios";
import StatisticalValues from "./components/StatisticalValues";
import emailjs from "emailjs-com";


function App() {

  const [buttonCamera, setButtonCamera] = useState(false);
  const [buttonStatisticalValues, setButtonStatisticalValues] = useState(false);
  const [maskValue, setMaskValue] = useState([]);
  const [noMaskValue, setNoMaskValue] = useState([]);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [getPopup, setPopup] = useState(false);
    const sound = new Howl({
        src: Sound
    });
  Howler.volume(0.1);
  var t = 0;
  var m = 0;
  var n = 0;

  useEffect(() => {
    axios.get("http://localhost:3001/api/getMask").then((response)=> {
      setMaskValue(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get("http://localhost:3001/api/getNoMask").then((response)=> {
      setNoMaskValue(response.data);
    })
  }, []);

  var maskFromDB = parseInt(maskValue.map((val)=> {
    return val.value
  }))

  var noMaskFromDB = parseInt(noMaskValue.map((val)=>{
    return val.value
  }))
  
  var totalMaskFromDB = maskFromDB + noMaskFromDB;

  var maskFromDBProcentage = parseInt((maskFromDB/totalMaskFromDB)*100);
  
  var noMaskFromDBProcentage =parseInt((noMaskFromDB/totalMaskFromDB)*100);

  const stats = () =>
  {
  if(maskFromDBProcentage > noMaskFromDBProcentage){
    return <h3 className="green">Mediul în care vă aflați prezintă <br></br> un risc <b>SCĂZUT</b> de răspândire a virusului Covid-19.</h3>;
  }else{
    return <h3 className="red">Mediul în care vă aflați prezintă <br></br> un risc <b>MĂRIT</b> de răspândire a virusului Covid-19.</h3>;
  }
  }

  function sendEmail() {

    var templateParams ={
      text: ''
    }

  emailjs.send('service_5ot2j1r','template_e415i89',templateParams,'user_e4kPcEAwjfQTrFPATDJnx')
    .then(function(response) {
       console.log('SUCCESS!', response.status, response.text);
    }, function(err) {
       console.log('FAILED...', err);
    });
  }

  const runCoco = async () => {
    
    const net = await tf.loadGraphModel('https://realtimefacemaskdetectionapp.s3.eu-de.cloud-object-storage.appdomain.cloud/model.json')
    
    setInterval(() => {
      detect(net);
    }, 16.7);
  };


  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {

      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const img = tf.browser.fromPixels(video)
      const resized = tf.image.resizeBilinear(img, [640,480])
      const casted = resized.cast('int32')
      const expanded = casted.expandDims(0)
      const obj = await net.executeAsync(expanded)

      //console.log(obj);

      const boxes = await obj[4].array()
      const classes = await obj[2].array()
      const scores = await obj[1].array()

      if(classes[0][0] === 1){
        t++;
        m++;
        axios.post("http://localhost:3001/api/updateMask", {maskValue : m});
      }else {
        t++;
        n++;
        axios.post("http://localhost:3001/api/updateNoMask", {noMaskValue : n});

      }

      if(n===50 || n===100 || n===150 || n===200 || n===250 || n===300 || n===350 || n===400 || n===450){
        setPopup(true);
        sound.play();
      }

      if(n===200){
        sendEmail();
      }

      const ctx = canvasRef.current.getContext("2d");
      requestAnimationFrame(()=>{drawRect(boxes[0], 
        classes[0], scores[0], 0.6, videoWidth, videoHeight, ctx)}); 

      tf.dispose(img)
      tf.dispose(resized)
      tf.dispose(casted)
      tf.dispose(expanded)
      tf.dispose(obj)

      console.log("\n")
      console.log("t: " + t);
      console.log("m: " + m);
      console.log("n: " + n);
      console.log("\n");

    }
  };



  useEffect(()=>{runCoco()},[]);
  
  return (
      <div className="App">
          
          <img src={pozaAlin} className="pozaAlin" />
      <header className="App-header">
              <img src={logo} className="Logo" />
            
              
              <div className ="buttonGroup">
                  <ReactiveButton
                      onClick={() => setButtonCamera(true)}
                      color={'secondary'}
                      idleText={'Start scanning'}
                      className="button1"
                      style={{ borderRadius: '5px' }}
                      outline={false}
                      shadow={true}
                      rounded={false}
                      size={'normal'}
                      block={false}
                      messageDuration={2000}
                      disabled={false}
                      buttonRef={null}
                      width={null}
                      height={null}
                      animation={true} />
                  <ReactiveButton
                      onClick={() =>  setButtonStatisticalValues(true)}
                      color={'secondary'}
                      idleText={'Last scan stats'}
                      className="button2"
                      style={{ borderRadius: '5px' }}
                      outline={false}
                      shadow={true}
                      rounded={false}
                      size={'normal'}
                      block={false}
                      messageDuration={2000}
                      disabled={false}
                      buttonRef={null}
                      width={null}
                      height={null}
                      animation={true} /> </div>
      
      </header>
          
          <body className="Body">
              <SocialIcon url="https://www.facebook.com/sandor.alin.nicu/" 
                          className="social-media-logos" />
              <SocialIcon url="https://www.instagram.com/alinsandor/" 
                          className="social-media-logos"/>
              <SocialIcon url="https://hangouts.google.com/group/g1gdUm3LP4XjfAFS8" 
                          className="social-media-logos"/>
              <SocialIcon url="https://github.com/SandorAlinNicu" 
                          className="social-media-logos"/>
          </body>

          <Camera trigger={buttonCamera} setTrigger={setButtonCamera} >
              <Webcam
                  ref={webcamRef}
                  muted={true}
                  style={{
                      position: "absolute",
                      marginLeft: "auto",
                      marginRight: "auto",
                      left: 0,
                      right: 0,
                      textAlign: "center",
                      zindex: 9,
                      width: 640,
                      height: 480
                  }}
              />
              <canvas
                  ref={canvasRef}
                  style={{
                      position: "absolute",
                      marginLeft: "auto",
                      marginRight: "auto",
                      left: 0,
                      right: 0,
                      textAlign: "center",
                      zindex: 8,
                      width: 640,
                      height: 480,
                  }}
              />

               <ReactiveButton
                    className="close-btn"
                    style={{ borderRadius: '30px' }}
                    size={'normal'}
                    animation={false}
                    shadow={true}
                    idleText={' '}
                    color={'red'}
                    onClick={(e) => {
                        window.location.href = 'http://localhost:3000/';
                      }}
                     />
          </Camera>

          <StatisticalValues trigger={buttonStatisticalValues} setTrigger={setButtonStatisticalValues}>
          <h1 className="title">Statistics of the last scan</h1>
          <h1 className="title">-----------------------------------------</h1>
          <h2 className="title">Mask scans:</h2>
          <h3 className="title">{parseInt((maskFromDB/totalMaskFromDB)*100)}%</h3>
          <h2 className="title">No mask scans:</h2>
          <h3 className="title">{parseInt((noMaskFromDB/totalMaskFromDB)*100)}%</h3>
          <h2 className="title">Total scans:</h2>
          <h3 className="title">{totalMaskFromDB}</h3>
          <h1 className="title">-----------------------------------------</h1>
          {stats()}

          <ReactiveButton
                    className="close-btn"
                    style={{ borderRadius: '30px' }}
                    size={'normal'}
                    animation={false}
                    shadow={true}
                    idleText={' '}
                    color={'red'}
                    onClick={(e) => {
                        window.location.href = 'http://localhost:3000/';
                      }}
                     />
          </StatisticalValues>

     <Popup trigger={getPopup} setTrigger={setPopup}></Popup>
    </div>
  );
}

export default App;