const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
const env = require('dotenv').config();


passport.use(new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: process.env.NODE_ENV === 'production' 
        ? 'https://www.shop2host.com/auth/google/callback' 
        : '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE google_id = ?', [profile.id]);
        if (rows.length > 0) {
            return done(null, rows[0]); // User already exists
        } else {
            const newUser = {
                name: profile.displayName,
                email: profile.emails[0].value,
                phone: '',
                google_id: profile.id,
                verified: true,
                created_at: new Date(),
            };
            const [result] = await db.query(
                'INSERT INTO users (name, email, phone, verified, google_id) VALUES (?, ?, ?, ?, ?)',
                [newUser.name, newUser.email, newUser.phone || null, newUser.verified, newUser.google_id]
            );
            newUser.id = result.insertId; // Assign the newly created user ID
            return done(null, newUser); // Pass the new user to done
        }
    } catch (error) {
        console.error('Error during Google authentication:', error);
        return done(error);
    }
}));

// Serialize user instance to session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        done(null, rows[0]);
    } catch (error) {
        done(error);
    }
});