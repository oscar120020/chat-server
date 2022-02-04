const { Router } = require("express");
const { check } = require("express-validator");
const Login = require("../controllers/auth");
const { fieldValidator } = require("../middlewares/fieldValidator");
const { validateJWT } = require("../middlewares/validateJWT");

const router = Router();

//register
router.post("/new",[
    check("name", "name is required").exists(),
    check("password", "password is required").exists(),
    check("email", "email is required").isEmail(),
    fieldValidator
], Login.createUser)

//login
router.post("/",[
    check("email", "El email es requerido").isEmail(),
    check("password", "La password es requerida").exists(),
    fieldValidator
],Login.login)

//renew token
router.get("/renew", validateJWT, Login.renewToken)


module.exports = router


