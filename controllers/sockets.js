const User = require("../models/userModel");
const Message = require("../models/messageModel");

const userConnected = async (uid) => {
  try {
    const user = await User.findById(uid);
    user.online = true;
    await user.save();

    return user;
  } catch (error) {
    console.log(error);
  }
};

const userDisconnected = async (uid) => {
  try {
    const user = await User.findById(uid);

    user.online = false;
    await user.save();

    return user;
  } catch (error) {
    console.log(error);
  }
};

const getAllUsers = async (uid) => {
  try {
    const users = await User.find().sort("-online");

    return users;
  } catch (error) {
    console.log(error);
  }
};

const saveMessages = async (data) => {
  try {
    const newMessage = new Message(data);
    await newMessage.save();
    return newMessage;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = {
  userConnected,
  userDisconnected,
  getAllUsers,
  saveMessages,
};
