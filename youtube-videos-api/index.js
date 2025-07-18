const mongoose = require('mongoose');
const { conection } = require('./database/conection');
const express = require('express');
const cors = require('cors');

// Models
const User = require('./models/User');

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
app.use('/api/user', UserRoutes);

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

