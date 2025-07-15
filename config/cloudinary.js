const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLUBE_CINEMA_CLOUDNARY_CLOUD_NAME,
  api_key: process.env.CLUBE_CINEMA_CLOUDNARY_API_KEY,
  api_secret: process.env.CLUBE_CINEMA_CLOUDNARY_API_SECRET
});

module.exports = cloudinary;
