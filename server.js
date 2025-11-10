const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const usersFilePath = path.join(__dirname, 'users.json');

const otpStore = {};
let users = [];

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'maholiyaankit58@gmail.com',
        pass: 'mmyw czfs rjwa wyqi'
    }
});

/**
 * Loads user data from a JSON file.
 */
async function loadUsers() {
    try {
        const data = await fs.readFile(usersFilePath, 'utf8');
        users = JSON.parse(data);
        console.log('User data loaded successfully.');
    } catch (error) {
        // If the file doesn't exist or is invalid, start with an empty array.
        // This is normal on the first run.
        console.log('User data file not found or corrupted. Starting with an empty user list.');
        users = [];
    }
}

/**
 * Saves the current user data to a JSON file.
 */
async function saveUsers() {
    try {
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
        console.log('User data saved successfully.');
    } catch (error) {
        console.error('Failed to save user data:', error);
    }
}

// Routes

app.post('/send-otp', async (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (users.find(u => u.email === email)) {
        return res.status(409).json({ success: false, message: 'User already exists. Please log in.' });
    }

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        otpStore[email] = {
            otp: otp,
            name: name,
            password: password,
            expires: Date.now() + 5 * 60 * 1000
        };

        const mailOptions = {
            from: 'maholiyaankit58@gmail.com',
            to: email,
            subject: 'SKYMART OTP Verification',
            html: `<div style="font-family: sans-serif; text-align: center; color: #121212;">
                      <h2 style="color: #00bcd4;">Welcome to SKYMART!</h2>
                      <p style="font-size: 1.1rem;">Your one-time password (OTP) for account verification is:</p>
                      <h1 style="font-size: 2.5rem; letter-spacing: 0.5rem; color: #121212; background-color: #f0f0f0; display: inline-block; padding: 1rem 2rem; border-radius: 10px; border: 2px solid #00bcd4;">${otp}</h1>
                      <p style="font-size: 0.9rem; color: #505050;">This code is valid for 5 minutes. Do not share this code with anyone.</p>
                  </div>`
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
        res.status(200).json({ success: true, message: 'OTP sent successfully.' });

    } catch (error) {
        console.error('Error sending OTP email:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    }
});

app.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const storedData = otpStore[email];

    if (!storedData || storedData.otp !== otp) {
        return res.status(401).json({ success: false, message: 'Invalid OTP.' });
    }

    if (Date.now() > storedData.expires) {
        delete otpStore[email];
        return res.status(401).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    users.push({
        email: email,
        name: storedData.name,
        password: storedData.password
    });
    
    await saveUsers();

    delete otpStore[email];

    res.status(200).json({ success: true, message: 'OTP verified successfully.', name: storedData.name });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ success: false, message: 'User is not registered. Please sign up.' });
    }

    if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    res.status(200).json({
        success: true,
        message: 'Login successful!',
        name: user.name
    });
});

(async () => {
    await loadUsers();
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log('To run the frontend, open landingpage.html in your browser.');
    });
})();