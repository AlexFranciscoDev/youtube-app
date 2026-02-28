// Dependencies
require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { conection } = require('./database/conection');

// Conexión a la base de datos (solo si no estamos en test)
if (process.env.NODE_ENV !== "test") {
  conection();
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  if (err) {
    res.status(400).send(`Error: ${err.message}`);
  } else {
    next();
  }
});

// Rutas
app.use('/api/user', require('./routes/user'));
app.use("/api/video", require("./routes/video"));
app.use("/api/category", require("./routes/category"));

// SOLO iniciar servidor si NO estamos en test
if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log("Servidor corriendo en el puerto", PORT);
    });
}

// Exportamos app para los tests
module.exports = app;
