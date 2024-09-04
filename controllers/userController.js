const express = require('express')
const db = require('../config/db')


const loadHome = (req,res,next)=>{
    try {
        res.render('home')
    } catch (error) {
        console.log(error.message);
        
    }
}

module.exports = {
    loadHome,
}