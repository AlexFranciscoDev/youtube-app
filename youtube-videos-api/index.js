// Dependencies
const mongoose = require('mongoose');
const { conection } = require('./database/conection');
const express = require('express');
const cors = require('cors');

// Models
const User = require('./models/User');
const Video = require('./models/Video');
const Category = require("./models/Category");

// Controllers
const UserController = require('./controllers/user');

// Conection to the database
conection();

// Create a server with express
const app = express();
const port = 3000;

// Middleware to use CORS
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((err, req, res, next) => {
  if (err) {
    res.status(400).send(`Error: ${err.message}`);
  } else {
    next();
  }
})

// Routes
const UserRoutes = require('./routes/user');
const VideoRoutes = require("./routes/video");
const CategoryRoutes = require("./routes/category");
app.use('/api/user', UserRoutes);
app.use("/api/video", VideoRoutes);
app.use("/api/category", CategoryRoutes);

// Listen requests on the specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})


