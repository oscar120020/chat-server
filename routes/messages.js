const { Router } = require("express");
const { getMessages, getFoundMessages, getMessagePosition } = require("../controllers/messages");
const { validateJWT } = require("../middlewares/validateJWT");
const router = Router();

//renew token
router.get("/:from", validateJWT, getMessages)
router.get("/find/:from", validateJWT, getFoundMessages)
router.get("/position/:from", validateJWT, getMessagePosition)

module.exports = router
