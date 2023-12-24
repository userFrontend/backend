const bcrypt = require('bcrypt')

const User = require("../model/userModel")
const {v4} = require('uuid');

const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, "../", "public");

const userCtl = {
    getUser: async (req, res) => {
        const {id} = req.params
        try {
            const findUser = await User.findById(id).select('email firstname lastname role profilePicture coverPicture about livesIn coutry works relationshit')
            if(findUser){
                return res.status(200).json({message: "Find user", user: findUser})
            }
            res.status(404).json({message: "User not found"})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
    getAllUsers: async (req, res) => {
        try {
            let users = await User.find().select('email firstname lastname role profilePicture coverPicture about livesIn coutry works relationshit')
            res.status(200).json({message: "All users", users})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
    deleteUser: async (req, res) => {
        const {id} = req.params
        try {
            if(id === req.user._id || req.userIsAdmin){
                const deleteUser = await User.findByIdAndDelete(id)
                if(deleteUser){
                    if(deleteUser.coverPicture){
                        fs.unlinkSync(path.join(uploadsDir, deleteUser.coverPicture), (err) => {
                            if(err){
                                return res.status(503).json({message: err.message})
                            }
                        })
                    }
                    if(deleteUser.profilePicture){
                        fs.unlinkSync(path.join(uploadsDir, deleteUser.profilePicture), (err) => {
                            if(err){
                                return res.status(503).json({message: err.message})
                            }
                        })
                    }
                    return res.status(200).json({message: "User deleted successfully", user: deleteUser})
                }
            }
            res.status(405).json({message: 'Acces Denied!. You can delete only your own accout'})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
    updateUser: async (req, res) => {
        const {id} = req.params
        try {
            if(id === req.user._id || req.userIsAdmin){
                const updateUser = await User.findById(id)
                if(req.body.password && (req.body.password != "")){
                    const hashedPassword = await bcrypt.hash(req.body.password, 10);
                    req.body.password = hashedPassword;
                } else{
                    delete req.body.password
                }

                if(updateUser){
                    if(req.files){
                        const {image, coverImage} = req.files;
                        if(coverImage){
                            const bgformat = coverImage.mimetype.split('/')[1];
                            if(bgformat !== 'png' && bgformat !== 'jpeg') {
                                return res.status(403).json({message: 'file format incorrect'})
                            }
                            if(coverImage.size > 1000000) {
                                return res.status(403).json({message: 'Image size must be less than (1) MB'})
                            }

                            const coverImg = `${v4()}.${bgformat}`
                            coverImage.mv(path.join(uploadsDir, coverImg), (err) => {
                                if(err){
                                    return res.status(503).json({message: err.message})
                                }
                            })
                            req.body.coverPicture = coverImg;

                            if(updateUser.coverPicture){
                                fs.unlinkSync(path.join(uploadsDir, updateUser.coverPicture), (err) => {
                                    if(err){
                                        return res.status(503).json({message: err.message})
                                    }
                                })
                            }
                        }
                        if(image){
                            const format = image.mimetype.split('/')[1];
                            if(format !== 'png' && format !== 'jpeg') {
                                return res.status(403).json({message: 'file format incorrect'})
                            }

                            if(image.size > 1000000) {
                                return res.status(403).json({message: 'Image size must be less than (1) MB'})
                            }

                            const nameImg = `${v4()}.${format}`
                            image.mv(path.join(uploadsDir, nameImg), (err) => {
                                if(err){
                                    return res.status(503).json({message: err.message})
                                }
                            })
                            req.body.profilePicture = nameImg;

                            if(updateUser.profilePicture){
                                fs.unlinkSync(path.join(uploadsDir, updateUser.profilePicture), (err) => {
                                    if(err){
                                        return res.status(503).json({message: err.message})
                                    }
                                })
                            }
                        }
                    }
                    const user = await User.findByIdAndUpdate(id, req.body, {new: true});
                    return res.status(200).json({message: "User update successfully", user})
                }
                return res.status(404).json({message: "User not found"})
            }
            res.status(405).json({message: 'Acces Denied!. You can delete only your own accout'})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },


}


module.exports = userCtl