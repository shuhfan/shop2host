const express = require('express')
const env = require('dotenv').config();
const db = require('../config/db')
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const nodemailer = require('nodemailer')
const dns = require('dns');
const { log } = require('console');


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const loadHome = (req, res, next) => {
  try {
    res.render('home')
  } catch (error) {
    console.log(error.message);

  }
}
const loadLitePlan = (req, res, next) => {
  try {
    res.render('liteplan')
  } catch (error) {
    console.log(error.message);

  }
}
const loadHeroPlan = (req, res, next) => {
  try {
    res.render('heroplan')
  } catch (error) {
    console.log(error.message);

  }
}
const loadProPlan = (req, res, next) => {
  try {
    res.render('proplan')
  } catch (error) {
    console.log(error.message);

  }
}
const loadFAQ = (req, res, next) => {
  try {
    res.render('faq')
  } catch (error) {
    console.log(error.message);

  }
}
const loadContact = (req, res, next) => {
  try {
    res.render('contact')
  } catch (error) {
    console.log(error.message);

  }
}

const loadAbout = (req, res, next) => {
  try {
    res.render('about')
  } catch (error) {
    console.log(error.message);

  }
}

const loadLogin = (req, res, next) => {
  try {
    res.render('login', { message: '' })
  } catch (error) {
    console.log(error.message);

  }
}

const loadSignup = (req, res, next) => {
  try {
    res.render('signup',{message:''})
  } catch (error) {
    console.log(error.message);

  }
}
const loadSignout = (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error while signing out:', err);
        return res.status(500).send('Error occurred during signout.');
      }
  
      // Clear the cookie
      res.clearCookie('connect.sid'); // This clears the session ID cookie
      res.redirect('/login'); // Redirect to login page or any other page after signout
    });
  } catch (error) {
    console.log(error.message);

  }
}

const signup = async (req, res) => {
  const { name, phone, email, password, confirmPassword } = req.body;

  // Basic validation
  if (!name || !phone || !email || !password || !confirmPassword) {
    return res.status(400).render('signup', { message: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).render('signup', { message: 'Passwords do not match.' });
  }

  try {
    // Check if user already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).render('signup', { message: 'User already exists.' });
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
    // Check if there's an original URL to redirect to
    const redirectUrl = req.session.originalUrl || '/dashboard'; // Default to dashboard if no original URL

    // Clear the original URL from the session after redirection
    delete req.session.originalUrl;

    res.status(201).render('login', { message: 'Registration successful! Please check your email to verify your account.' })
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).render('signup', { message: 'An error occurred while registering the user.' });
  }
}

const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).render('login', { message: 'Email and Password are required.' });
  }

  try {
    // Check if user exists and is verified
    const [user] = await db.query('SELECT * FROM users WHERE email = ? AND verified = ?', [email, true]);
    if (user.length === 0) {
      return res.status(400).render('login', { message: 'User not found or Email not verified.' });
    }

    const existingUser = user[0];

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).render('login', { message: 'Incorrect Email or password.' });
    }

    // Set user session
    req.session.user_id = existingUser.id;

    // Check if there’s an original URL stored in the session
    const redirectUrl = req.session.originalUrl || '/dashboard'; // Redirect to original URL or default to dashboard
    console.log(req.session.originalUrl);
    
    // Clear the original URL after use
    delete req.session.originalUrl;

    // Redirect to the intended page or dashboard
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).render('login', { message: 'An error occurred while logging in.' });
  }
};


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

    res.status(200).render('login', { message: 'Email verification successful! You can now log in.' });
  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).send('An error occurred during email verification.');
  }
};

const loadTC = (req, res) => {
  try {
    res.render('TC')
  } catch (error) {
    console.log(error.message);

  }
}

const privacyPolicy = (req, res) => {
  try {
    res.render('privacyPolicy')
  } catch (error) {
    console.log(error.message);

  }
}

const loadDashboard = async (req, res) => {
  const userId = req.session.user_id || req.user.id; // Assuming you have user ID in session
  let stores = [];

  try {
      // Fetch user's stores from the database
      const [rows] = await db.query('SELECT * FROM stores WHERE user_id = ?', [userId]);
      stores = rows; // Store the retrieved stores

      // Render the dashboard with store data
      res.render('dashboard', { stores });
  } catch (error) {
      console.error('Error fetching stores:', error);
      res.render('dashboard', { stores: [] }); // Render with empty array on error
  }
}

const loadCreateStore = (req, res) => {
  try {
    const selectedPlan = req.query.plan;
    const amount = req.query.amount;

    req.session.plan = selectedPlan;
    req.session.amount = amount;
    res.render('create-store')
  } catch (error) {
    console.log(error.message);

  }
}

const loadStoreDetails = (req, res) => {
  try {
    res.render('store-details')
  } catch (error) {
    console.log(error.message);

  }
}

const loadFindDomain = (req, res) => {
  try {
    res.render('find-domain', { selectedPlan: req.session.plan, message: '', isAvailable: false })
  } catch (error) {
    console.log(error.message);

  }
}

const loadBusinessEmail = (req, res) => {
  try {
    res.render('business-email',{ selectedDomain: req.session.selectedDomain})
  } catch (error) {
    console.log(error.message);

  }
}

const loadPricingPlan = (req, res) => {
  try {
    res.render('pricing-plan')
  } catch (error) {
    console.log(error.message);

  }
}

const createStore = async (req, res) => {
  const { productType, experience, productCount } = req.body;

  // Basic validation
  if (!productType || !experience || !productCount) {
    return res.status(400).render('create-store', { message: 'All fields are required.' });
  }

  try {
    await db.query('INSERT INTO store_info (user_id, product_type, experience, product_count) VALUES (?, ?, ?, ?)',
      [req.session.user_id, productType, experience, productCount]);

    // Redirect to the next step (e.g., domain availability check)
    res.redirect('/store-details');
  } catch (error) {
    console.error('Error saving store details:', error);
    res.status(500).render('create-store', { message: 'An error occurred while saving your details.' });
  }
}

const storeDetails = async (req, res) => {
  const { storeName, address, email, phone, whatsapp } = req.body;
  const logo = req.file ? req.file.filename : null;

  // Basic validation
  if (!storeName || !address || !email || !phone || !whatsapp) {
    return res.status(400).render('store-details', { message: 'All fields are required.' });
  }

  try {
    // Insert store details into the database
    const [result] = await db.query('INSERT INTO stores (user_id, name, logo, address, email, phone, whatsapp) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.session.user_id || req.user.id, storeName, logo, address, email, phone, whatsapp]);

      req.session.store_id = result.insertId;

    // Redirect to the next step (e.g., domain availability check)
    res.redirect('/find-domain');
  } catch (error) {
    console.error('Error saving store details:', error);
    res.status(500).render('store-details', { message: 'An error occurred while saving your details.' });
  }
}

const findDomain = async (req, res) => {
  const { domainName } = req.body;
  const selectedPlan = req.session.plan;
  const fullDomain = selectedPlan === 'lite' ? `${domainName}.in` : `${domainName}.com`;

  let isAvailable = false;

  if (fullDomain) {
      dns.lookup(fullDomain, (err) => {
          if (err) {
              // Domain is available
              isAvailable = true;
          }

          // Respond with JSON data for front-end handling
          res.json({ isAvailable });
      });
  } else {
      res.status(400).json({ message: "Please enter a valid domain name." });
  }
}

const saveNewDomain =  async (req, res) => {
  const { domainName } = req.body;
  const selectedPlan = req.session.plan;
  const fullDomain = selectedPlan === 'lite' ? `${domainName}.in` : `${domainName}.com`;

  const storeId = req.session.store_id;

  try {
      // Save the new domain to the database with is_existing set to false
      const [result] = await db.query('INSERT INTO domains (store_id, domain_name, is_existing) VALUES (?, ?, ?)', 
          [storeId, fullDomain, false]);
          req.session.selectedDomain = fullDomain;

      res.status(200).json({ message: 'Domain saved successfully!' });
  } catch (error) {
      console.error('Error saving new domain:', error);
      res.status(500).json({ message: 'An error occurred while saving your new domain.' });
  }
}

const existingDomain =  async (req, res) => {
  const { existingDomainName } = req.body;
  
  const storeId = req.session.store_id; // Ensure this is set when creating a store

  if (!storeId) {
      return res.status(400).render('find-domain', { 
          message: 'Store ID is not available. Please create a store first.',
          isAvailable: false,
          selectedPlan: req.session.plan 
      });
  }

  try {
      // Save the existing domain to the database with is_existing set to true
      await db.query('INSERT INTO domains (store_id, domain_name, is_existing) VALUES (?, ?, ?)', 
          [storeId, existingDomainName, true]);
          req.session.selectedDomain = existingDomainName;
      // Redirect to the business email page
      res.redirect('/business-email');
  } catch (error) {
      console.error('Error saving existing domain:', error);
      res.render('find-domain', { 
          message: 'An error occurred while saving your existing domain.',
          isAvailable: false,
          selectedPlan: req.session.plan 
      });
  }
}

const saveBusinessEmail = async (req, res) => {
  const { subdomain } = req.body;
  const storeId = req.session.store_id; // Ensure this is set when creating a store

  // Construct the full email address
  const selectedDomain = req.session.selectedDomain || 'shop2host.com'; // Fallback domain if not set
  const fullEmail = `${subdomain}@${selectedDomain}`;

  try {
      // Save the business email to the database
      await db.query('INSERT INTO business_emails (store_id, email) VALUES (?, ?)', 
          [storeId, fullEmail]);

      // Redirect or render success message
      res.redirect('/ecommerce-demo'); // Change this to your desired redirect page after saving
  } catch (error) {
      console.error('Error saving business email:', error);
      res.render('business-email', { 
          message: 'An error occurred while saving your business email.',
          selectedDomain: req.session.selectedDomain // Pass back the selected domain
      });
  }
}

const loadEcommerceDemo = async (req, res) => {
  const storeId = req.session.store_id; // Get the store ID from the session
  let storeData;

  try {
      // Fetch store details from the database
      const [rows] = await db.query('SELECT name, logo, phone, email, address FROM stores WHERE id = ?', [storeId]);
      storeData = rows[0]; // Get the first row of data
console.log(storeData);

      // If no data found, use dummy data
      if (!storeData) {
          storeData = {
              store_name: 'Sample Store',
              logo: 'https://via.placeholder.com/150', // Dummy logo
              contact_number: '123-456-7890',
              email: 'info@samplestore.com'
          };
      }

      // Render the e-commerce index page with the store data
      res.render('ecommerce-demo', { store: storeData , layout: false });
  } catch (error) {
      console.error('Error fetching store data:', error);
      res.render('ecommerce-demo', {
          store: {
              store_name: 'Sample Store',
              logo: 'https://via.placeholder.com/150',
              contact_number: '123-456-7890',
              email: 'info@samplestore.com'
          }
      });
  }
}

const loadBilling = (req,res)=>{
  try {
    res.render('billing')
  } catch (error) {
    console.log(error.message);
    
  }
}

const saveOrder =  async (req, res) => {
  const storeId = req.session.store_id || 8;
  const { name, email, phone, address, state, country, pin_code } = req.body;

  try {
      // Save personal details, billing address, and store ID to the database
      await db.query('INSERT INTO orders (name, email, phone, address, state, country, pin_code, store_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
          [name, email, phone, address, state, country, pin_code, storeId]);

      // Redirect or render success message
      res.redirect('/dashboard');
  } catch (error) {
      console.error('Error saving order:', error);
      res.render('error', { message: 'An error occurred while saving your order.' });
  }
}

const loadOpenTicket = (req,res)=>{
  try {
    res.render('open-ticket')
  } catch (error) {
    console.log(error.message);
    
  }
}

const loadSupport = (req,res)=>{
  try {
    res.render('view-ticket')
  } catch (error) {
    console.log(error.message);
    
  }
}

const loadStoreManegment = async (req, res) => {
  const userId = req.session.user_id; // Assuming you have user ID in session
  let stores = [];

  try {
      // Fetch user's stores from the database
      const [rows] = await db.query('SELECT * FROM stores WHERE user_id = ?', [userId]);
      stores = rows; // Store the retrieved stores

      // Render the dashboard with store data
      res.render('store-management', { stores });
  } catch (error) {
      console.error('Error fetching stores:', error);
      res.render('store-management', { stores: [] }); // Render with empty array on error
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
  loadSignout,
  signup,
  login,
  verifyEmail,
  loadTC,
  privacyPolicy,
  loadDashboard,
  loadCreateStore,
  loadStoreDetails,
  loadFindDomain,
  loadBusinessEmail,
  loadPricingPlan,
  createStore,
  storeDetails,
  findDomain,
  saveNewDomain,
  existingDomain,
  saveBusinessEmail,
  loadEcommerceDemo,
  loadBilling,
  saveOrder,
  loadOpenTicket,
  loadSupport,
  loadStoreManegment,

}
