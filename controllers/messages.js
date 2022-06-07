const Messages = require("../models/messageModel")
const User = require("../models/userModel")
const Group = require("../models/groupModel")

const getMessages = async(req, res) => {
    const myId = req.uid
    const {from} = req.params
    let offset = parseInt(req.query.offset)
    let isGroup = req.query.isGroup

    try {
        // Get messages
        if(offset < 0){
            offset = 0
        }
        let last20Msg = await Messages.find({
            $or:[
                {to: myId, from},
                {to: from, from: myId},
                {to: from}
            ]
        })
        .sort({createdAt: "desc"})
        .skip(offset)
        .limit(20)
        
        // Get user
        const user = isGroup === "true" ? await Group.findById(from) : await User.findById(from)

        // Order messages
        last20Msg = last20Msg.sort((a, b) => a.createdAt - b.createdAt)

        // Response
        res.json({
            ok: true,
            messages: last20Msg,
            user
        })
    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: `${error.stringValue} is not a valid ${error.kind}`
        })
    }


}

const getFoundMessages = async(req, res) => {
    const myId = req.uid
    const {from} = req.params
    const offset = parseInt(req.query.offset)
    const queryMessage = req.query.message
    
    try {
        // Get messages
        let last20Msg = await Messages.find({
            $or:[
                {to: myId, from},
                {to: from, from: myId},
                {to: from}
            ],
            message: {$regex: queryMessage, $options: "i"}
        })
        .sort({createdAt: "desc"})
        .skip(offset)
        .limit(20)

        // Response
        res.json({
            ok: true,
            messages: last20Msg
        })
    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: `${error.stringValue} is not a valid ${error.kind}`
        })
    }
}

const getMessagePosition = async(req, res) => {
    const myId = req.uid
    const {from} = req.params
    const messageId = req.query.messageId
    
    try {
        // Get messages
        let allMessages = await Messages.find({
            $or:[
                {to: myId, from},
                {to: from, from: myId},
                {to: from}
            ],
        })

        const element = allMessages.findIndex((msg) => msg.id === messageId)

        // Response
        res.json({
            ok: true,
            msgPosition: element,
            tl: allMessages.length
        })
    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: `${error.stringValue} is not a valid ${error.kind}`
        })
    }
}


module.exports = {
    getMessages,
    getFoundMessages,
    getMessagePosition
}