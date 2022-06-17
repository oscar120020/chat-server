const cloudinary = require('cloudinary').v2

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY_CLOUDINARY, 
    api_secret: process.env.API_SECRET_CLOUDINARY,
    secure: true
});

const cloudinary_upload = async (image) => {
    return await cloudinary.uploader.upload(image, {
        folder: "image-perfil"
    })
}

module.exports = {
    cloudinary_upload
}