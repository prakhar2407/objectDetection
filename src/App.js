// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { div } from "@tensorflow/tfjs";
import PageVisibility from "react-page-visibility";

function App() {
  // const [objects, setObjects] = useState([]);
  // const isVisible = usePageVisibility();
  const [data, setData] = useState(null);
  // const currTime = new Date().getSeconds();
  // const [time, setTime] = useState();
  // const [photo, setPhoto] = useState(null);
  // const [info, setInfo] = useState(new Map());
  const parentDiv = useRef();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const photoRef = useRef(null);
  const handle = useFullScreenHandle();
  const app = useRef(null);

  useEffect(() => {}, [data]);

  useEffect(() => {
    console.log("App loaded.");
    runCoco();
  }, []);

  useEffect(() => {
    takePicture();
    setInterval(() => {
      console.log("Taking picture.");
      takePicture();
    }, 5000);
  }, []);

  // useEffect(() => {
  //   toggleFullScreen();
  // }, []);

  // const toggleFullScreen = () => {
  //   handle.enter;
  // };

  // useEffect(() => {}, [objects]);

  // Main function
  // const uploadImage = async (file) => {
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   // Connect to a seaweedfs instance
  // };
  // useEffect(() => {
  //   toggleFullScreen();
  // }, []);

  // function toggleFullScreen() {
  //   if (!document.fullscreenElement) {
  //     parentDiv.requestFullscreen();
  //   } else {
  //     if (document.exitFullscreen) {
  //       document.exitFullscreen();
  //     }
  //   }
  // }

  const takePicture = () => {
    console.log("inside take picture");
    let width = 300;
    let height = 300;
    let video = webcamRef.current.video;
    let photo = photoRef.current;
    // let photo2 = webcamRef.current.getScreenshot();
    // setPhoto(photo2);
    // console.log(photo2);
    console.log();
    photo.width = width;
    photo.height = height;
    const d = new Date();
    let ctx = photo.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.strokeText(
      `${d.getFullYear()}-${
        d.getMonth() + 1
      }-${d.getDate()}  ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`,
      10,
      50
    );
  };

  // let printData = (d) => {
  //   console.log(d);
  // };
  const runCoco = async () => {
    const net = await cocossd.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 1000);
  };

  let countSeconds = 0;

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const obj = await net.detect(video);
      setData(
        new Map([
          [obj.map((x) => x.class), obj.map((x) => x.score)],
          ["timeStamp", Date.now()],
        ])
      );

      let countPerson = 0;
      let personFound = false;
      for (var i = 0; i < obj.length; i++) {
        if (obj[i].class === "cell phone") {
          takePicture();
          break;
        }
        if (obj[i].class === "person") {
          personFound = true;
          countPerson++;
          if (countPerson >= 2) {
            takePicture();
            break;
          }
        }
      }
      if (!personFound) {
        countSeconds++;
        if (countSeconds >= 5) {
          // exit the program
        }
      } else {
        countSeconds = 0;
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawRect(obj, ctx);
    }
  };

  return (
    <>
      <PageVisibility
        onChange={(visibility) => {
          console.log(visibility);
        }}
      >
        <div
          ref={app}
          onCopy={(e) => {
            e.preventDefault();
            console.log("copied");
          }}
        >
          <h1>Hello World</h1>
          <h1>Hello World</h1>
          <h1>Hello World</h1>
          <h1>Hello World</h1>
          <h1>Hello</h1>
          <input
            type="text"
            onPaste={(e) => {
              e.preventDefault();
              return false;
            }}
            onCopy={(e) => {
              e.preventDefault();
              return false;
            }}
          />
          <button onClick={handle.enter}>Enter fullscreen</button>
          <div>
            <FullScreen
              className="fullscreen"
              onChange={(value, handle) => {
                console.log(value + " " + handle);
              }}
              handle={handle}
            >
              <div className="App" ref={parentDiv}>
                {/* <h1>Objects are: </h1>
              {data.map((d) => {
              return <p>{d.class}</p>;
              })} */}
                <Webcam
                  screenshotFormat="image/jpeg"
                  ref={webcamRef}
                  muted={true}
                  style={{
                    position: "absolute",
                    // marginLeft: "auto",
                    // marginRight: "auto",
                    left: 0,
                    bottom: 0,
                    zindex: 9,
                    width: 300,
                    height: 300,
                  }}
                />

                <canvas
                  ref={canvasRef}
                  style={{
                    position: "absolute",
                    // marginLeft: "auto",
                    // marginRight: "auto",
                    left: 0,
                    bottom: 0,
                    textAlign: "center",
                    zindex: 8,
                    width: 300,
                    height: 300,
                  }}
                />
                <canvas
                  style={{
                    postion: "absolute",
                    bottom: "0",
                    right: "0",
                    width: 300,
                    height: 300,
                  }}
                  ref={photoRef}
                ></canvas>
              </div>
            </FullScreen>
          </div>
        </div>
      </PageVisibility>
    </>
  );
}

export default App;
