const isLogin = async (req,res,next)=>{
    try{
        if(req.session.user_id || req.isAuthenticated()){
            next()
        }else{
            res.redirect('/login')
        }
    }
    catch (error){
        console.log(error.message);
    }
}

const isLogout = async (req,res,next)=>{
    try{
        if(req.session.user_id || req.isAuthenticated()){
            res.redirect('/dashboard')
        }
        next()
    }
    catch (error){
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}