const multer = require('multer');
const path = require('path');

// Storage configuration to save the images (multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define where the images are going to be saved
    // General images
    let folder = 'uploads/others';
    // Check the route and save it depending on the url
    if (req.baseUrl.includes('category')) {
        folder = 'uploads/categories';
    } else if (req.baseUrl.includes('video')) {
        folder = 'uploads/videos';
    }

    cb(null, folder);
  },
    // Define the name of the files
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
})

// Create Multer instance with the settings made
const upload = multer({storage});

module.exports = upload;