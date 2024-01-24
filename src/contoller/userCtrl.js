const bcrypt = require('bcrypt')
const cloudinary = require('cloudinary')
const User = require("../model/userModel")
const fs = require('fs');

//cloudinary 
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
})

const removeTemp = (pathes) => {
  fs.unlink(pathes, err => {
    if(err){
      throw err
    }
  })
}

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
                const deleteUser = await User.findById(id)
                if(deleteUser){
                    if(deleteUser.coverPicture){
                        await cloudinary.v2.uploader.destroy(deleteUser.coverPicture.public_id, async (err) =>{
                            if(err){
                                throw err
                            }
                        })
                    }
                    if(deleteUser.profilePicture){
                        await cloudinary.v2.uploader.destroy(deleteUser.profilePicture.public_id, async (err) =>{
                            if(err){
                                throw err
                            }
                        })
                    }
                    await deleteUser.deleteOne({_id: id})
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

                            const coverImagee = await cloudinary.v2.uploader.upload(coverImage.tempFilePath, {
                                folder: 'Mern-chat'
                            }, async (err, result) => {
                                if(err){
                                    throw err
                                } else {
                                    console.log(coverImage);
                                    removeTemp(coverImage.tempFilePath)
                                    return result
                                }
                            })
                            if(updateUser.coverPicture){
                                await cloudinary.v2.uploader.destroy(updateUser.coverPicture.public_id, async (err) =>{
                                    if(err){
                                        throw err
                                    }
                                })
                            }
                            const coverImag = {public_id : coverImagee.public_id, url: coverImagee.secure_url}
                            req.body.coverPicture = coverImag;
                            
                        }
                        if(image){
                            const format = image.mimetype.split('/')[1];
                            if(format !== 'png' && format !== 'jpeg') {
                                return res.status(403).json({message: 'file format incorrect'})
                            } else if(image.size > 1000000) {
                                return res.status(403).json({message: 'Image size must be less than (1) MB'})
                            }
                            const imagee = await cloudinary.v2.uploader.upload(image.tempFilePath, {
                                folder: 'Mern-chat'
                            }, async (err, result) => {
                                if(err){
                                    throw err
                                } else {
                                    removeTemp(image.tempFilePath)
                                    return result
                                }
                            })
                            if(updateUser.profilePicture){
                                await cloudinary.v2.uploader.destroy(updateUser.profilePicture.public_id, async (err) =>{
                                    if(err){
                                        throw err
                                    }
                                })
                            }
                           
                            const imag = {public_id : imagee.public_id, url: imagee.secure_url}
                            req.body.profilePicture = imag;

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