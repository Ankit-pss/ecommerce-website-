const express = require('express');
const cors = require('cors');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.', { index: 'landingpage.html' }));

// Load users
const usersFile = './users.json';
const getUsers = () => {
  if (fs.existsSync(usersFile)) {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  }
  return [];
};

const saveUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// In-memory OTP storage
const pendingSignups = {};

// Nodemailer setup
let transporter;
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
    return;
  }
  
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
  console.log(`Nodemailer test account created. Email will be sent via Ethereal Email.`);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({ message: 'Login successful', name: user.name, email: user.email });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/send-otp', (req, res) => {
  const { name, email, password } = req.body;
  
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pendingSignups[email] = { name, email, password, otp };

  if (transporter) {
    const mailOptions = {
      from: '"Skhymart Support" <support@skhymart.com>',
      to: email,
      subject: 'Your Skhymart OTP',
      text: `Your OTP for Skhymart registration is: ${otp}`,
      html: `<b>Your OTP for Skhymart registration is: ${otp}</b>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send OTP' });
      }
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      console.log(`Generated OTP for ${email}: ${otp}`);
      res.json({ message: 'OTP sent' });
    });
  } else {
    // If test account not ready yet
    console.log(`Fallback OTP for ${email}: ${otp}`);
    res.json({ message: 'OTP sent' });
  }
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const pending = pendingSignups[email];

  if (!pending) {
    return res.status(400).json({ error: 'No pending signup found for this email' });
  }

  if (pending.otp === otp) {
    const users = getUsers();
    users.push({
      email: pending.email,
      name: pending.name,
      password: pending.password
    });
    saveUsers(users);
    delete pendingSignups[email];
    
    res.json({ message: 'Registration successful' });
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
