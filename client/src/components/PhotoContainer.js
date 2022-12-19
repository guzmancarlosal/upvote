import React, { useEffect } from "react";
import { MdOutlineArrowUpward } from "react-icons/md";

import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";

const PhotoContainer = ({ photos, socket }) => {
  const handleUpvote = (id) => {
    socket.emit("photoUpvote", {
      userID: localStorage.getItem("_id"),
      photoID: id,
    });
  };

  // The function sends email to the user - (to_email key)
  const sendEmail = (email) => {
    emailjs
      .send(
        "service_kk93u4e",
        "template_p0pt5kh",
        {
          to_email: email,
          from_email: localStorage.getItem("_myEmail"),
        },
        "coXfUhprc8tKoIakh"
      )
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  useEffect(() => {
    socket.on("upvoteSuccess", (data) => {
      toast.success(data.message);
      // logs the email of the user who owns the image.

      sendEmail(data.item[0]._ref);
    });
    socket.on("upvoteError", (data) => {
      toast.error(data.error_message);
    });
  }, [socket]);

  return (
    <main className="photoContainer">
      {photos.map((photo) => (
        <div className="photo" key={photo.id}>
          <div className="imageContainer">
            <img
              src={photo.image_url}
              alt={photo.id}
              className="photo__image"
            />
          </div>

          <button className="upvoteIcon" onClick={() => handleUpvote(photo.id)}>
            <MdOutlineArrowUpward
              style={{ fontSize: "20px", marginBottom: "5px" }}
            />
            <p style={{ fontSize: "12px", color: "#ce7777" }}>
              {photo.vote_count}
            </p>
          </button>
        </div>
      ))}
    </main>
  );
};

export default PhotoContainer;
