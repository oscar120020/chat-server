const { Schema, model } = require("mongoose")

const UserSchema = Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        unique: true
    },
    imageUrl: {
        extraSmall: String,
        small: String,
        medium: String,
    },
    online: {
        type: Boolean,
        default: false
    },
})

UserSchema.method("toJSON", function(){
    const { __v, _id, password, ...object } = this.toObject();
    object.uid = _id
    return object
})

module.exports = model("User", UserSchema)