const Message = require("../model/messageModel")
const cloudinary = require('cloudinary')
const {v4} = require('uuid');

const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  })
  
const removeTemp = (path) => {
    fs.unlink(path, err => {
      if(err){
        throw err
      }
    })
  }

const messageCtrl = {
    addMessage: async (req, res) => {
        const {chatId, senderId} = req.body
        try {
            if(!chatId || !senderId){
                return res.status(403).json({message: 'Invalid credentials'});
            }

            if(req.files){
                const {image} = req.files;
                const format = image.mimetype.split('/')[1];
                if(format !== 'png' && format !== 'jpeg') {
                    return res.status(403).json({message: 'file format incorrect'})
                }
                if(image.size > 1000000) {
                    return res.status(403).json({message: 'Image size must be less than (1) MB'})
                }
                const messageImage = await cloudinary.v2.uploader.upload(image.tempFilePath, {
                    folder: 'Mern-chat'
                }, async (err, result) => {
                    if(err){
                        throw err
                    } else {
                        removeTemp(image.tempFilePath)
                        return result
                    }
                })
                req.body.file = messageImage;
            }
            const messages = new Message(req.body)
            await messages.save()
            res.status(201).json({message: 'new message', messages})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
    getMessage: async (req, res) => {
        const {chatId} = req.params;
        try {
            const messages = await Message.find({chatId});
            res.status(200).json({message: "Chat's messages", messages})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },

    deleteMessage: async (req, res) => {
        const {messageId} = req.params
        try {
            const deletedMessage = await Message.findById(messageId);
            if(deletedMessage){
                if(deletedMessage.file !== null){
                    await cloudinary.v2.uploader.destroy(deletedMessage.file.public_id, async (err) =>{
                        if(err){
                            throw err
                        }
                    })
                }
                await Message.findOneAndDelete(messageId)
                return res.status(200).json({message: 'Message deleted!', deletedMessage})
            }
            res.status(404).json({message: 'Message not found!'})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
    updateMessage: async (req, res) => {
        const {messageId} = req.params
        try {
            const updateMessage = await Message.findById(messageId)
                if(updateMessage){
                    if(req.files){
                        const {image} = req.files;
                        if(image){
                            const bgformat = image.mimetype.split('/')[1];
                            if(bgformat !== 'png' && bgformat !== 'jpeg') {
                                return res.status(403).json({message: 'file format incorrect'})
                            }
                            if(image.size > 1000000) {
                                return res.status(403).json({message: 'Image size must be less than (1) MB'})
                            }

                            const messageImagee = await cloudinary.v2.uploader.upload(image.tempFilePath, {
                                folder: 'Mern-chat'
                            }, async (err, result) => {
                                if(err){
                                    throw err
                                } else {
                                    removeTemp(image.tempFilePath)
                                    return result
                                }
                            })
                            await cloudinary.v2.uploader.destroy(updateMessage.file.public_id, async (err) =>{
                                if(err){
                                    throw err
                                }
                            })
                            const messageImag = {public_id : messageImagee.public_id, url: messageImagee.secure_url}
                            req.body.file = messageImag;
                        }
                    }
                    const isMessage = await Message.findByIdAndUpdate(messageId, req.body, {new: true});
                    return res.status(200).json({message: "Message update successfully", isMessage})
                }
                res.status(404).json({message: "Message not found"})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
}

module.exports = messageCtrl
