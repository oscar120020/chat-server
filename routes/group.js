const { Router } = require("express");
const { createGroup, getGroups, changeGroupPerfil } = require("../controllers/group");
const { validateJWT } = require("../middlewares/validateJWT");
const router = Router();

//renew token
router.post("/create", validateJWT, createGroup)
router.get("/my-groups", validateJWT, getGroups)
// router.get("/find/:from", validateJWT, getFoundMessages)
// router.get("/position/:from", validateJWT, getMessagePosition)
router.post("/group-perfil/:groupId", validateJWT, changeGroupPerfil)

module.exports = router