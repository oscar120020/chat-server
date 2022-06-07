const Group = require("../models/groupModel")
const AWS = require("aws-sdk")
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const spacesEndpoint = new AWS.Endpoint(process.env.DIGITALOCEAN_API)
const s3 = new AWS.S3({
  endpoint: spacesEndpoint
})

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

const getGroups = async(req, res) => {
    const myId = req.uid
    try {
        const myGroups = await Group.find({
            $or:[
                {admin: myId},
                {users: [myId]}
            ]
        })

        res.json({
            ok: true,
            myGroups
        })
        
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: error
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
  
      const response = await Group.findByIdAndUpdate(groupId, {imageUrl: imageUrlObject}, {
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

const getMessages = async(req, res) => {

    const myId = req.uid
    const {groupId} = req.params

    try {
        const group = await Group.findById(groupId)
        res.json({
            ok: true,
            groupMessages
        })
       
    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: `${error.stringValue} is not a valid ${error.kind}`
        })
    }
}

const addMessage = async(req ,res) => {
    try {
        
    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: `${error.stringValue} is not a valid ${error.kind}`
        })
    }
}

const getMessagePosition = async(req, res) => {

    try {
        
    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: `${error.stringValue} is not a valid ${error.kind}`
        })
    }
}


module.exports = {
    createGroup,
    getGroups,
    getMessages,
    getMessagePosition,
    changeGroupPerfil
}