const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { generateJWT } = require("../helpers/jwt");

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
    res.status(500).json({
      ok: false,
      msg: "Contact the admin",
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

const Login = {
  createUser,
  login,
  renewToken,
};

module.exports = Login;
