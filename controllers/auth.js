const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { generateJWT } = require("../helpers/jwt");
const AWS = require("aws-sdk")
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const spacesEndpoint = new AWS.Endpoint(process.env.DIGITALOCEAN_API)
const s3 = new AWS.S3({
  endpoint: spacesEndpoint
})

//register
const createUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // email exist
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(400).json({
        ok: false,
        msg: "El emial ya está en uso",
      });
    }
    const user = new User(req.body);
    // encrypt password
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(password, salt);
    user.userName = ""

    // save data
    await user.save();

    // Generate JWT
    const token = await generateJWT(user.id);

    res.status(201).json({
      ok: true,
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacte al admin",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userDb = await User.findOne({ email });

    // user exist?
    if (!userDb) {
      return res.status(404).json({
        ok: false,
        msg: "Email no registrado",
      });
    }

    // validate password
    const validatePass = bcrypt.compareSync(password, userDb.password);
    if (!validatePass) {
      return res.status(401).json({
        ok: false,
        msg: "Contraseña incorrecta",
      });
    }

    //generate JWT
    const token = await generateJWT(userDb.id)


    res.status(200).json({
      ok: true,
      token,
      user: userDb
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "contact the admin",
    });
  }
};

const renewToken = async (req, res) => {
  try {
    const {uid} = req
    const user = await User.findOne({_id: uid})
    const token = await generateJWT(uid)

    if(user){
      res.json({
        ok: true,
        token,
        user
      });
    }else{
      res.json({
        ok: false,
        msg: "No se encontraron registros"
      });
    }
  
  } catch (error) {
    res.json({
      ok: false,
      msg: "no se pudo regenerar"
    });
  }
};

const changeName = async (req, res) => {
  try {
    const myId = req.uid
    const { name } = req.body;

    response = await User.findByIdAndUpdate(myId, {name}, {
      new: true
    })

    res.json({
      ok:true,
      response
    })

  } catch (err) {
    res.json({
      ok:false
    })
  }
}

const changePassword = async (req, res) => {
  try {
    const myId = req.uid
    const { newPass, currentPass } = req.body;

    const userDb = await User.findById(myId);

    const validatePass = bcrypt.compareSync(currentPass, userDb.password);
    if (!validatePass) {
      return res.status(401).json({
        ok: false,
        msg: "La contraseña actual no es correcta",
      });
    }

    // encrypt password
    const salt = bcrypt.genSaltSync(10);
    const newPassCrypt = bcrypt.hashSync(newPass, salt);

    const response = await User.findByIdAndUpdate(myId, {password: newPassCrypt})

    res.json({
      ok:true,
      response
    })

  } catch (err) {
    res.json({
      ok:false
    })
  }
}

const changePerfil = async(req, res) => {
  const acceptFiles = ["image/png", "image/jpg", "image/jpeg"]
  try {
    const myId = req.uid
    const {image} = req.files

    if(!image){
      return
    }

    if(!acceptFiles.includes(image.mimetype)){
      return res.status(403).json({
        ok: false,
        msg: "archivo no permitido"
      })
    }

    const imageId = uuidv4()

    const extraSmallImage = await sharp(image.data).resize(50).toBuffer()
    const smallImage = await sharp(image.data).resize(100).toBuffer()
    const mediumImage = await sharp(image.data).resize(300).toBuffer()
    
    await s3.putObject({
      ACL: 'public-read',
      Bucket: process.env.BUCKET_NAME,
      Body: extraSmallImage,
      Key: `extrasmall-${imageId}-${image.name}`
    }).promise()

    await s3.putObject({
      ACL: 'public-read',
      Bucket: process.env.BUCKET_NAME,
      Body: smallImage,
      Key: `small-${imageId}-${image.name}`
    }).promise()

    await s3.putObject({
      ACL: 'public-read',
      Bucket: process.env.BUCKET_NAME,
      Body: mediumImage,
      Key: `medium-${imageId}-${image.name}`
    }).promise()
    

    const imageUrlObject = {
      extraSmall: `https://${process.env.BUCKET_NAME}.${process.env.DIGITALOCEAN_API}/extrasmall-${imageId}-${image.name}`,
      small: `https://${process.env.BUCKET_NAME}.${process.env.DIGITALOCEAN_API}/small-${imageId}-${image.name}`,
      medium: `https://${process.env.BUCKET_NAME}.${process.env.DIGITALOCEAN_API}/medium-${imageId}-${image.name}`,
    }

    const response = await User.findByIdAndUpdate(myId, {imageUrl: imageUrlObject}, {
      new: true
    })

    res.json({
      ok: true,
      response
    })
    
  } catch (error) {
    console.log(error);
    res.status(401).json({
      ok: false,
      msg: "no se pudo guardar"
    })
  }
}

const updateUserName = async(req, res) => {
  try {
    const userName = req.body.userName
    const myId = req.uid

    // console.log(username);
    // console.log(myId);

    const response = await User.findByIdAndUpdate(myId, {userName}, {new: true})

    res.json({
      ok: true,
      response
    })
  } catch (error) {
    if(error.codeName === "DuplicateKey"){
      res.status(403).json({
        ok: false,
        msg: "Este nombre de usuario ya está en uso"
      })
    }
  }
}

const Login = {
  createUser,
  login,
  renewToken,
  changeName,
  changePassword,
  changePerfil,
  updateUserName
};

module.exports = Login;
