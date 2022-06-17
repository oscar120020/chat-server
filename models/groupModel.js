const { Schema, model } = require("mongoose")

const GroupSchema = Schema({
    name: {
        type: String,
        required: true
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    imageUrl: {
        extraSmall: String,
        small: String,
        medium: String,
    },
    users: {
        type: Array,
        default: []
    }
})

GroupSchema.method("toJSON", function(){
    const { __v, _id, ...object } = this.toObject();
    object.groupId = _id
    return object
})

module.exports = model("Group", GroupSchema)