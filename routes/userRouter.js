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
user_router.get('/pricing',userController.loadPricing)
user_router.get('/faq',userController.loadFAQ)
user_router.get('/contact',userController.loadContact)
user_router.get('/about',userController.loadAbout)
user_router.get('/login',userController.loadLogin)
user_router.get('/signup',userController.loadSignup)
user_router.get('/verify-email',userController.verifyEmail)

user_router.post('/signup',userController.signup)
user_router.post('/login',userController.login)


module.exports = user_router;
