const Group = require("../models/groupModel")
const AWS = require("aws-sdk")
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const fs = require('fs');

const createGroup = async(req, res) => {
    const myId = req.uid
    const { members, name } = req.body

    try {
        const newGroup = await new Group({
            name,
            admin: myId,
            users: [...members]
        })

        await newGroup.save()

        res.json({
            ok: true,
            newGroup
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg1: `${error.stringValue} is not a valid ${error.kind}`,
            msg2: error
        })
    }


}

const changeGroupPerfil = async(req, res) => {
    const acceptFiles = ["image/png", "image/jpg", "image/jpeg"]
    try {
      const myId = req.uid
      const groupId = req.params.groupId
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
  
      const response = await Group.findByIdAndUpdate(groupId, {imageUrl: imageUrlObject}, {
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


module.exports = {
    createGroup,
    changeGroupPerfil
}