import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";
import PhotoContainer from "./PhotoContainer";

const SharePhoto = ({ socket }) => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  //👇🏻 This accepts the username from the URL (/share/:user)
  const { user } = useParams();
  useEffect(() => {
    const authenticateUser = () => {
      const id = localStorage.getItem("_id");

      // If ID is false, redirects the user to the login page
      if (!id) {
        navigate("/");
      } else {
        socket.emit("sharePhoto", user);
      }
    };
    authenticateUser();
  }, [navigate, socket, user]);

  useEffect(() => {
    socket.on("sharePhotoMessage", (data) => setPhotos(data));
  }, [socket]);

  return (
    <div>
      <Nav />
      <PhotoContainer socket={socket} photos={photos} />
    </div>
  );
};

export default SharePhoto;
