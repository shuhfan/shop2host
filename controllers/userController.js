const express = require('express')
const env = require('dotenv').config();
const db = require('../config/db')
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.EMAIL_PASS, 
  },
});

const loadHome = (req,res,next)=>{
    try {
        res.render('home')
    } catch (error) {
        console.log(error.message);
        
    }
}
const loadLitePlan = (req,res,next)=>{
    try {
        res.render('liteplan')
    } catch (error) {
        console.log(error.message);
        
    }
}
const loadHeroPlan = (req,res,next)=>{
  try {
      res.render('heroplan')
  } catch (error) {
      console.log(error.message);
      
  }
}
const loadProPlan = (req,res,next)=>{
  try {
      res.render('proplan')
  } catch (error) {
      console.log(error.message);
      
  }
}
const loadFAQ = (req,res,next)=>{
    try {
        res.render('faq')
    } catch (error) {
        console.log(error.message);
        
    }
}
const loadContact = (req,res,next)=>{
    try {
        res.render('contact')
    } catch (error) {
        console.log(error.message);
        
    }
}

const loadAbout = (req,res,next)=>{
    try {
        res.render('about')
    } catch (error) {
        console.log(error.message);
        
    }
}

const loadLogin = (req,res,next)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
        
    }
}

const loadSignup = (req,res,next)=>{
    try {
        res.render('signup')
    } catch (error) {
        console.log(error.message);
        
    }
}

const signup = ('/signup', async (req, res) => {
    const { name, phone, email, password, confirmPassword } = req.body;
  
    // Basic validation
    if (!name || !phone || !email || !password || !confirmPassword) {
      return res.status(400).send('All fields are required.');
    }
    
    if (password !== confirmPassword) {
      return res.status(400).send('Passwords do not match.');
    }
  
    try {
      // Check if user already exists
      const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        return res.status(400).send('User already exists.');
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Insert the user into the database
      const result = await db.query(
        'INSERT INTO users (name, phone, email, password, verificationToken, verified) VALUES (?, ?, ?, ?,?, ?)',
        [name, phone, email, hashedPassword, verificationToken, false]
      );

      // Send verification email
      const verificationLink = `${process.env.BASE_URL}/verify-email?token=${verificationToken}&email=${email}`;

      const mailOptions = {
        from: process.env.EMAIL,  
        to: email,
        subject: 'Email Verification - Shop2Host',
        html: `<p>Hi ${name},</p>
               <p>Thank you for registering. Please verify your email by clicking the link below:</p>
               <a href="${verificationLink}">Verify Email</a>`,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(201).send('Registration successful! Please check your email to verify your account.');
    } catch (error) {
      console.error('Error during user registration:', error);
      res.status(500).send('An error occurred while registering the user.');
    }
  })

const login = ('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Basic validation
    if (!email || !password) {
      return res.status(400).send('Email and password are required.');
    }
  
    try {
      // Check if user exists and is verified
    const [user] = await db.query('SELECT * FROM users WHERE email = ? AND verified = ?', [email, true]);
    if (user.length === 0) {
      return res.status(400).send('User not found or email not verified.');
    }
  
      const existingUser = user[0];
  
      // Compare the password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, existingUser.password);
  
      if (!isMatch) {
        return res.status(400).send('Incorrect password.');
      }
  
      // If everything is okay, create a session or token (depending on how you handle authentication)
      // For simplicity, let's just send a success message here
      res.send('Login successful!');
    } catch (error) {
      console.error('Error during user login:', error);
      res.status(500).send('An error occurred while logging in.');
    }
  });

  const verifyEmail = async (req, res) => {
    const { token, email } = req.query;
  
    if (!token || !email) {
      return res.status(400).send('Invalid request.');
    }
  
    try {
      // Check if user exists with the provided email and token
      const [user] = await db.query('SELECT * FROM users WHERE email = ? AND verificationToken = ?', [email, token]);
      if (user.length === 0) {
        return res.status(400).send('Invalid token or email.');
      }
  
      // Update user's verified status to true and remove the verification token
      await db.query('UPDATE users SET verified = ?, verificationToken = ? WHERE email = ?', [true, null, email]);
  
      res.status(200).send('Email verification successful! You can now log in.');
    } catch (error) {
      console.error('Error during email verification:', error);
      res.status(500).send('An error occurred during email verification.');
    }
  };

const loadTC = (req,res)=>{
  try {
    res.render('TC')
  } catch (error) {
    console.log(error.message);
    
  }
}

const privacyPolicy = (req,res)=>{
  try {
    res.render('privacyPolicy')
  } catch (error) {
    console.log(error.message);
    
  }
}

module.exports = {
    loadHome,
    loadLitePlan,
    loadHeroPlan,
    loadProPlan,
    loadFAQ,
    loadContact,
    loadAbout,
    loadLogin,
    loadSignup,
    signup,
    login,
    verifyEmail,
    loadTC,
    privacyPolicy,
}