const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    text: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    file: {
        type: Object,
        default: null,
    },
},
{timestamps: true},
)

module.exports = mongoose.model("Message", messageSchema)