const express = require('express')
const user_router = express()
const upload = require('../multer/multer')
const session = require('express-session')
const passport = require('passport');
require('../config/passport-setup');
const config = require('../config/session')
user_router.use(session({
    secret : config.userSession,
    resave: false,
    saveUninitialized: true,
    cookie : {secure:false}
}))
user_router.use(passport.initialize());
user_router.use(passport.session());
const auth = require('../middleware/authentication')
const userController = require('../controllers/userController')

user_router.use((req, res, next)=> {
    const currentUrl = req.originalUrl;
    res.locals.pathname = req.path;
    if (!req.session.user_id && req.method === 'GET' &&  !['/login', '/signup'].includes(currentUrl)) {
      req.session.originalUrl = req.originalUrl; 
      
    }
    next();
  })

user_router.set('view engine','ejs')
user_router.set('views','./views/user')
user_router.set('layout','../layouts/layout')

user_router.get('/',auth.isLogout,userController.loadHome)
user_router.get('/liteplan',auth.isLogout,userController.loadLitePlan)
user_router.get('/heroplan',auth.isLogout,userController.loadHeroPlan)
user_router.get('/proplan',auth.isLogout,userController.loadProPlan)
user_router.get('/faq',auth.isLogout,userController.loadFAQ)
user_router.get('/contact',auth.isLogout,userController.loadContact)
user_router.get('/about',auth.isLogout,userController.loadAbout)
user_router.get('/login',auth.isLogout,userController.loadLogin)
user_router.get('/signup',auth.isLogout,userController.loadSignup)
user_router.get('/signout',userController.loadSignout)
user_router.get('/verify-email',userController.verifyEmail)
user_router.get('/terms-condition',userController.loadTC)
user_router.get('/privacy-policy',userController.privacyPolicy)
user_router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'] 
}));

user_router.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login', 
}), (req, res) => {
  console.log('User authenticated:', req.user);
  console.log('Session Data:', req.session);
    res.redirect(req.session.originalUrl || '/dashboard');
});


user_router.get('/dashboard',auth.isLogin,userController.loadDashboard)  
user_router.get('/create-store',auth.isLogin,userController.loadCreateStore)
user_router.get('/store-details',auth.isLogin,userController.loadStoreDetails)
user_router.get('/find-domain',auth.isLogin,userController.loadFindDomain)
user_router.get('/business-email',auth.isLogin,userController.loadBusinessEmail)
user_router.get('/ecommerce-demo',userController.loadEcommerceDemo)
user_router.get('/pricing-plan',auth.isLogin,userController.loadPricingPlan)
user_router.get('/billing',auth.isLogin,userController.loadBilling)
user_router.get('/openticket',auth.isLogin,userController.loadOpenTicket)
user_router.get('/support',auth.isLogin,userController.loadSupport)
user_router.get('/store-management',auth.isLogin,userController.loadStoreManegment)
user_router.get('/support-ticket/:ticketId',auth.isLogin,userController.loadTicket)
user_router.get('/transactions',auth.isLogin,userController.loadTransactions)

user_router.post('/signup',userController.signup)
user_router.post('/login',userController.login)
user_router.post('/create-store',auth.isLogin,userController.createStore)
user_router.post('/store-details',auth.isLogin,  upload.single('logo'),userController.storeDetails)
user_router.post('/find-domain',auth.isLogin,userController.findDomain)
user_router.post('/save-new-domain',auth.isLogin,userController.saveNewDomain)
user_router.post('/save-existing-domain',auth.isLogin,userController.existingDomain)
user_router.post('/save-business-email',auth.isLogin,userController.saveBusinessEmail)
user_router.post('/save-billing-details',auth.isLogin,userController.saveBillingDetails)
user_router.post('/createOrder',auth.isLogin,userController.createOrder)
user_router.post('/payment-success',auth.isLogin,userController.paymentSuccess )
user_router.post('/support-ticket',auth.isLogin, upload.single('attachments'),userController.supportTicket)
user_router.post('/support-ticket/reply/:ticketId',auth.isLogin,upload.single('attachments'),userController.ticketReplay)
user_router.post('/support-ticket/:ticketId/reply',auth.isLogin,userController.replyToTicket)

module.exports = user_router;
