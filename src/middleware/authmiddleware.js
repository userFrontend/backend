const JWT = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const authMiddleware = (req, res, next) => {
    let token = req.headers.token;
    if(!token) {
        return res.status(401).json({message: "token is required"})
    }
    try {
        const decode = JWT.verify(token, JWT_SECRET_KEY);
        req.user = decode;
        if(decode.role === 101) {
            req.userIsAdmin = true
        }
        next()
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = authMiddleware