const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { generateJWT } = require("../helpers/jwt");
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { cloudinary_upload } = require("../helpers/cloudinary");
const fs = require('fs')

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
    console.log(error);
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

    await Promise.all([
      sharp(image.tempFilePath).resize(50).toFile(`${image.tempFilePath}-${imageId}-extraSmall-${image.name}`),
      sharp(image.tempFilePath).resize(100).toFile(`${image.tempFilePath}-${imageId}-small-${image.name}`),
      sharp(image.tempFilePath).resize(300).toFile(`${image.tempFilePath}-${imageId}-medium-${image.name}`)
    ])

    const uploadResults = await Promise.all([
      cloudinary_upload(`${image.tempFilePath}-${imageId}-extraSmall-${image.name}`),
      cloudinary_upload(`${image.tempFilePath}-${imageId}-small-${image.name}`),
      cloudinary_upload(`${image.tempFilePath}-${imageId}-medium-${image.name}`),
    ])

    const imageUrlObject = {
      extraSmall: uploadResults[0].url,
      small: uploadResults[1].url,
      medium: uploadResults[2].url,
    }

    const response = await User.findByIdAndUpdate(myId, {imageUrl: imageUrlObject}, {
      new: true
    })

    fs.unlink(image.tempFilePath, () => {})
    fs.unlink(`${image.tempFilePath}-${imageId}-extraSmall-${image.name}`, () => {})
    fs.unlink(`${image.tempFilePath}-${imageId}-small-${image.name}`, () => {})
    fs.unlink(`${image.tempFilePath}-${imageId}-medium-${image.name}`, () => {})

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

    const isUserNameUsed = await User.findOne({userName})

    if(isUserNameUsed){
      return res.status(403).json({
        ok: false,
        msg: "Este nombre de usuario ya está en uso"
      })
    }

    const response = await User.findByIdAndUpdate(myId, {userName}, {new: true})

    res.json({
      ok: true,
      response
    })
  } catch (error) {
    res.status(400).json({
      ok: false,
      msg: error
    })
  }
}

const getFoundUsers = async (req, res) => {
  
  try {
    const myId = req.uid
    const {name} = req.body
    
    const myUser = await User.findById(myId);
    const usersFound = await User.find()

    const result = usersFound.map(user => {
      if(
        user._id != myId 
        && user.userName.toLowerCase().includes(name.toLowerCase()) 
        && !myUser.friends.includes(user._id) 
        && !user.requestSended.includes(myId)
      ){
        if(myUser.requestSended.includes(user._id)){
          return {
            name: user.name,
            userName: user.userName,
            uid: user._id,
            image: user.imageUrl.medium,
            sended: true
          }
        }else{
          return {
            name: user.name,
            userName: user.userName,
            uid: user._id,
            image: user.imageUrl.medium,
            sended: false
          }
        }
      }
    }).filter(notNull => notNull !== undefined)

    res.status(200).json({
      ok: true,
      result
    })
    
  } catch (error) {
    res.status(400).json({
      ok: false,
      error
    })
  }
}

const addFriend = async(req, res) => {
  try {
    const myId = req.uid
    const {friendId, userName} = req.body
    
    await User.findByIdAndUpdate(friendId, {"$pull": {requestSended: myId}})
    await User.findByIdAndUpdate(friendId, {"$push": {friends: myId}})
    await User.findByIdAndUpdate(myId, {"$push": {friends: friendId}}, {new:true})
    const user = await User.findByIdAndUpdate(myId, {"$pull": {requests: {userName}}}, {new: true})

    res.status(200).json({
      ok: true,
      user
    })
    
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      error
    })
  }
}

const doFriendRequest = async(req, res) => {
  try {
    const myId = req.uid
    const {friendId} = req.body

    const userWhoSend = await User.findById(myId)

    const newRequest = {
      name: userWhoSend.name,
      uid: userWhoSend._id,
      userName: userWhoSend.userName,
      image: userWhoSend.imageUrl?.medium
    }
    
    await User.findByIdAndUpdate(friendId, {"$push": {requests: newRequest}})
    await User.findByIdAndUpdate(myId, {"$push": {requestSended: friendId}})

    res.status(200).json({
      ok: true,
      message: "Solicitud enviada con exito"
    })
    
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      error
    })
  }
}

const getUserById = async(req, res) => {
  try {
    const myId = req.uid

    const user = await User.findById(myId);

    res.status(200).json({
      ok: true,
      user
    })
    
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      error
    })
  }
}

const getSimpleUser = async(req, res) => {
  try {
    const myId = req.uid
    const { userId } = req.body

    const user = await User.findById(userId);

    res.status(200).json({
      ok: true,
      user: {
        name: user.name,
        image: user.imageUrl.medium ?? "",
        id: user._id
      }
    })
    
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      error
    })
  }
}

const Login = {
  createUser,
  login,
  renewToken,
  changeName,
  changePassword,
  changePerfil,
  updateUserName,
  getFoundUsers,
  addFriend,
  doFriendRequest,
  getUserById,
  getSimpleUser,
};

module.exports = Login;
