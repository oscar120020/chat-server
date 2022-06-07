const User = require("../models/userModel");
const Message = require("../models/messageModel");
const Group = require("../models/groupModel");

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
    const myUser = await User.findById(uid);
    const users = await User.find().sort("-online");

    const result = users.filter((user) => {
      if (user._id != uid && myUser.friends.includes(user._id)) {
        return user;
      }
    });

    return result;
  } catch (error) {
    console.log(error);
  }
};

const getGroups = async (myId) => {
  try {
    const myGroups = await Group.find({
      $or: [
        { admin: myId }, 
        { users: {$in: [myId]} }
      ],
    });

    return myGroups
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
  getGroups,
};
