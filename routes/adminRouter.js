const express = require('express') 
const admin_router = express()
const session = require('express-session')
const config = require('../config/session')
const adminController = require('../controllers/adminController')
admin_router.use(session({
    secret:config.adminSession,
    resave : false,
    saveUninitialized : true,
    cookie : {secure:false}
}))

admin_router.set('view engine','ejs')
admin_router.set('views','./views/admin')
admin_router.set('layout','../layouts/layout')

admin_router.get('/',adminController.loadDashboard)
admin_router.get('/category',adminController.loadAddCategory)
admin_router.get('/user-management',adminController.loadUserManagement)


admin_router.post('/add-category',adminController.addCategory)
admin_router.post('/delete-category/:id',adminController.deleteCategory)
admin_router.post('/delete-user/:id',adminController.deleteUser)

module.exports = admin_router