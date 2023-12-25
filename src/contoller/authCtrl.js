const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt')

const User = require("../model/userModel")

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const authCtrl = {
    signup: async (req, res) => {   
        const {email} = req.body
        try {
            const existingUser = await User.findOne({email});
            if(existingUser) {
                return res.status(400).json({message: "This is email already exists!"})
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
            if(req.body.role){
                req.body.role = Number(req.body.role)
            }

            const user = new User(req.body);
            await user.save();
            const {password, ...otherDetails} = user._doc
            const token = JWT.sign(otherDetails, JWT_SECRET_KEY, {expiresIn: '1h'});

            res.status(201).json({message: 'Signup successfully', user: otherDetails, token})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
    
    login: async (req, res) => {
        const {email} = req.body
        try {
            const findUser = await User.findOne({email});   
            if(!findUser){
                return res.status(400).json({message: 'Login or Password is inCorrect'});
            }
            const verifyPassword = await bcrypt.compare(req.body.password, findUser.password);
            if(!verifyPassword){
                return res.status(400).json({message: 'Login or Password is inCorrect'})
            }
            const {password, ...otherDetails} = findUser._doc
            const token = JWT.sign(otherDetails, JWT_SECRET_KEY, {expiresIn: '1h'})

            res.status(200).json({message: 'Login successfully', user: otherDetails, token})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
}

module.exports = authCtrl