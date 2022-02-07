const Messages = require("../models/messageModel")

const getMessages = async(req, res) => {
    const myId = req.uid
    const {from} = req.params

    try {
        const last20Msg = await Messages.find({
            $or:[
                {to: myId, from},
                {to: from, from: myId}
            ]
        })
        .sort({createdAt: "asc"})
        .limit(35)    

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


module.exports = {
    getMessages
}