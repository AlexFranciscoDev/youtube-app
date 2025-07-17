const { conection } = require('./database/conection');
const express = require('express');
const cors = require('cors');

// Conection to the database
conection();

// Create a server with express
const app = express();
const port = 3000;

// Middleware to use CORS
app.use(cors());

// Listen requests on the specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

// Routes 
app.get('/', (req, res) => {
  res.status(200).send({
    nombre: 'Alex',
    apellido: 'Francisco',
    curso: 'Web Development'
  })
}); 