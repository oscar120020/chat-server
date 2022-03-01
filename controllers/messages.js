const Messages = require("../models/messageModel")
const User = require("../models/userModel")

const getMessages = async(req, res) => {
    const myId = req.uid
    const {from} = req.params

    try {
        // Get messages
        let last20Msg = await Messages.find({
            $or:[
                {to: myId, from},
                {to: from, from: myId}
            ]
        })
        .sort({createdAt: "desc"})
        .limit(35)
        
        // Get user
        const user = await User.findById(from)

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


module.exports = {
    getMessages
}