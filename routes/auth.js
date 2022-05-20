const { Router } = require("express");
const { check } = require("express-validator");
const multer = require("multer");
const Login = require("../controllers/auth");
const { fieldValidator } = require("../middlewares/fieldValidator");
const { validateJWT } = require("../middlewares/validateJWT");

const router = Router();

//register
router.post(
  "/new",
  [
    check("name", "name is required").exists(),
    check("password", "password is required").exists(),
    check("email", "email is required").isEmail(),
    fieldValidator,
  ],
  Login.createUser
);

//login
router.post(
  "/",
  [
    check("email", "El email es requerido").isEmail(),
    check("password", "La password es requerida").exists(),
    fieldValidator,
  ],
  Login.login
);

//renew token
router.get("/renew", validateJWT, Login.renewToken);

//update Name
router.put("/changeName/:myId", validateJWT, Login.changeName);

//Change password
router.put("/changePassword/:myId", validateJWT, Login.changePassword);

//change Perfi;
router.post("/changePerfil/:myId", validateJWT, Login.changePerfil);

//update user name;
router.put("/update-username", validateJWT, Login.updateUserName);

//get found users;
router.post("/get-found-users", validateJWT, Login.getFoundUsers);

//add new friend;
router.post("/add-friend", validateJWT, Login.addFriend);

//add new friend;
router.post("/friend-request", validateJWT, Login.doFriendRequest);

//get user;
router.get("/get-user", validateJWT, Login.getUserById);

module.exports = router;
