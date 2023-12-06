const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose');

const path = require('path')
dotenv.config();

//routes
const authRouter = require('./src/router/authRouter');
const userRouter = require('./src/router/userRouter');
const chatRouter = require('./src/router/chatRouter');
const messageRouter = require('./src/router/messageRouter');


const app = express();
const PORT = process.env.PORT || 4001;

//to save filess for public
app.use(express.static(path.join(__dirname, 'src', 'public')))
//middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload());
app.use(cors());

// routes use
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, {})
.then(() => {
    app.listen(PORT, () => console.log(`Server stared on port: ${PORT}`))
})
.catch(error => console.log(error))
