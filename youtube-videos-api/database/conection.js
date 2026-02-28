const mongoose = require("mongoose");

const conection = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/youtube-app";
    await mongoose.connect(mongoUri);
    console.log("Youtube app database connected successfully");
    // await mongoose.connect('mongodb://localhost:27017/youtube-app');
    // console.log('Youtube app database connected successfully');
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

module.exports = {
  conection,
};
