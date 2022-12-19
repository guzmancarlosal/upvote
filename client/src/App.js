import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Photos from "./components/Photos";
import Login from "./components/Login";
import Register from "./components/Register";
import UploadPhoto from "./components/UploadPhoto";
import MyPhotos from "./components/MyPhotos";
import SharePhoto from "./components/SharePhoto";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";

const App = () => {
  const socket = io.connect("http://localhost:4000");

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login socket={socket} />}></Route>
          <Route
            path="/register"
            element={<Register socket={socket} />}
          ></Route>
          <Route path="/photos" element={<Photos socket={socket} />}></Route>
          <Route
            path="/photo/upload"
            element={<UploadPhoto socket={socket} />}
          ></Route>
          <Route
            path="/user/photos"
            element={<MyPhotos socket={socket} />}
          ></Route>
          <Route
            path="/share/:user"
            element={<SharePhoto socket={socket} />}
          ></Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  );
};

export default App;
