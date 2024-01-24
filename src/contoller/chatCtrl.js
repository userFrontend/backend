const Chat = require("../model/chatModel")
const cloudinary = require('cloudinary')
const Message = require("../model/messageModel")

const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  })

const chatCtrl = {
    userChats: async (req, res) => {
        const {_id} = req.user
        try {
            const chats = await Chat.find({members: {$in: [_id]}});
            res.status(200).json({message: 'User chat', chats})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
    findChat: async (req, res) => {
        const {firstId, secondId} = req.params;
        try {
            const chat = await Chat.findOne({members: {$all: [firstId, secondId]}});
            if(chat){
                return res.status(200).json({message: "foud chat", chat})
            }
            const newChat = new Chat({members: [firstId, secondId]})
            await newChat.save()
            return res.status(201).json({message: "foud chat", chat: newChat})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
    deleteChat: async (req, res) => {
        const {chatId} = req.params
        try {
            const chat = await Chat.findById(chatId);
            if(chat){
                (await Message.find({chatId: chat._id})).forEach(async message => {
                    if(message.file !== null){
                        await cloudinary.v2.uploader.destroy(message.file.public_id, async (err) =>{
                            if(err){
                                throw err
                            }
                        })
                    }
                })
                await Message.deleteMany({chatId: chat._id})
                await Chat.findByIdAndDelete(chat._id)
                return res.status(200).json({message: 'chat deleted successfully'})
            }
            res.status(404).json({message: 'Chat not foud'})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
}

module.exports = chatCtrl;