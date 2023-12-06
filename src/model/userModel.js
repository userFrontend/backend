const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        default: 100,
        enum: [100, 101], // 100 - user , 101 - admin
    },
    profilePicture: {
        type: Object,
        default: null,
    },
    coverPicture: {
        type: Object,
        default: null,
    },
    about: String,
    livesIn: String,
    coutry: String,
    works: String,
    relationshit: String,
},
{timestamps: true},
)

module.exports = mongoose.model("User", userSchema)