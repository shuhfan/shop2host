const express = require('express')
const user_router = express()
const session = require('express-session')
const config = require('../config/session')
user_router.use(session({
    secret : config.userSession,
    resave: false,
    saveUninitialized: true,
    cookie : {secure:false}
}))
const auth = require('../middleware/authentication')
const userController = require('../controllers/userController')

user_router.set('view engine','ejs')
user_router.set('views','./views/user')
user_router.set('layout','../layouts/layout')

user_router.get('/',userController.loadHome)

module.exports = user_router;
