const multer = require('multer');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Route -> folder, shared by both storage backends
const folderFor = (req) => {
  if (req.baseUrl.includes('category')) return 'categories';
  if (req.baseUrl.includes('video')) return 'videos';
  return 'others';
};

// Tests run offline and shouldn't hit the real Cloudinary account, so they
// fall back to local disk storage under uploads/<folder>.
const storage = process.env.NODE_ENV === 'test'
  ? multer.diskStorage({
      destination: (req, file, cb) => cb(null, path.join('uploads', folderFor(req))),
      filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
    })
  : (() => {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      return new CloudinaryStorage({
        cloudinary,
        params: (req) => ({ folder: `youtube-app/${folderFor(req)}` }),
      });
    })();

// Create Multer instance with the settings made
const upload = multer({ storage });

module.exports = upload;
