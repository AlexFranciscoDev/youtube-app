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

const UserTest = new User({
  username: 'Bob',
  email: 'bob@bob.es',
  password: 'prueba'
})

// Routes 
app.get('/', (req, res) => {
  res.status(200).send({
    nombre: 'Alex',
    apellido: 'Francisco',
    curso: 'Web Development',
    user: UserTest
  })
}); 

