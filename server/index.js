const express = require("express");
const app = express();
const PORT = 4000;

const http = require("http").Server(app);
const cors = require("cors");

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const database = [];
const generateID = () => Math.random().toString(36).substring(2, 10);

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("register", (data) => {
    // Destructure the user details from
    const { username, email, password } = data;
    // Filters the database (array) to check if there's no existing user with the same email or username
    let result = database.filter(
      (user) => user.email === email || user.username === username
    );
    // If none, saves the data to the array. (the empty images array is required for the image uploads)
    if (result.length === 0) {
      database.push({
        id: generateID(),
        username,
        password,
        email,
        images: [],
      });
      // returns an event stating that the registration was successful
      return socket.emit("registerSuccess", "Account created successfully!");
    }
    // This runs only when there is an error/the user already exists
    socket.emit("registerError", "User already exists");
  });

  socket.on("login", (data) => {
    // Destructure the credentials from the object
    const { username, password } = data;

    // Filters the array for existing objects with the same email and password
    let result = database.filter(
      (user) => user.username === username && user.password === password
    );
    // If there's none, it returns this error message
    if (result.length !== 1) {
      return socket.emit("loginError", "Incorrect credentials");
    }

    // Returns the user's email & id if the user exists
    socket.emit("loginSuccess", {
      message: "Login successfully",
      data: {
        _id: result[0].id,
        _email: result[0].email,
      },
    });
  });

  socket.on("uploadPhoto", (data) => {
    //gets the id, email, and image URL
    const { id, email, photoURL } = data;
    // Search the database for the user
    let result = database.filter((user) => user.id === id);
    // creates the data structure for the image
    const newImage = {
      id: generateID(),
      image_url: photoURL,
      vote_count: 0,
      votedUsers: [],
      _ref: email,
      ownerId: id,
    };
    // adds the new image to the images array
    result[0]?.images.unshift(newImage);
    // sends a new event containing the server response
    socket.emit("uploadPhotoMessage", "Upload Successful!");
  });

  socket.on("allPhotos", (data) => {
    // an array to contain all the images
    let images = [];
    // loop through the items in the database
    for (let i = 0; i < database.length; i++) {
      // collect the images into the array
      images = images.concat(database[i]?.images);
    }

    // send all the images through another event
    socket.emit("allPhotosMessage", {
      message: "Photos retrieved successfully",
      photos: images,
    });
  });

  socket.on("getMyPhotos", (id) => {
    // Filter the database items
    let result = database.filter((db) => db.id === id);
    // Returns the images and the username
    socket.emit("getMyPhotosMessage", {
      data: result[0]?.images,
      username: result[0]?.username,
    });
  });

  socket.on("sharePhoto", (name) => {
    // Filters the database via the username
    let result = database.filter((db) => db.username === name);
    // Returns the images via another event
    socket.emit("sharePhotoMessage", result[0]?.images);
  });

  socket.on("photoUpvote", (data) => {
    const { userID, photoID } = data;
    console.log("userId=======", userID);
    console.log("photoID==========", photoID);
    let images = [];
    // saves all the images not belong to the user into the images array
    for (let i = 0; i < database.length; i++) {
      images = images.concat(database[i]?.images);
    }

    // Filter the images array for the image selected for upvote
    const item1 = images.filter(
      (image) => image.id === photoID && image.ownerId === userID
    );

    // Returns this error if the selected image doesn't belong to the other users
    if (item1.length > 0) {
      return socket.emit("upvoteError", {
        error_message: "You cannot upvote your photos",
      });
    }
    const item = images.filter((image) => image.id === photoID);

    // Gets the list of voted users from the selected image
    const voters = item[0]?.votedUsers;
    // Checks if the user has not upvoted the image before
    const authenticateUpvote = voters.filter((voter) => voter === userID);
    // if true (the first time the user is upvoting the image)
    if (!authenticateUpvote.length) {
      // increases the vote count
      item[0].vote_count += 1;
      // adds the user ID to the list of voters
      voters.push(userID);
      // triggers this event to reflect the change in vote count
      socket.emit("allPhotoMessage", {
        message: "Photos retrieved successfully",
        photos: images,
      });
      // returns the upvote response
      return socket.emit("upvoteSuccess", {
        message: "Upvote successful",
        item,
      });
    } else {
      return socket.emit("upvoteError", {
        error_message: "You already upvoted this photo",
      });
    }

    /*
    nullifies duplicate votes. (if the user ID already exists in the array of voted users)
    */
    socket.emit("upvoteError", {
      error_message: "Duplicate votes are not allowed",
    });
  });

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
