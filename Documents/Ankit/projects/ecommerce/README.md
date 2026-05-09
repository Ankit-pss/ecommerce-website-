# Skhymart E-commerce Application

Skhymart is a simple, lightweight e-commerce web application built with a Node.js/Express backend and a vanilla HTML/JS frontend. It features an authentication system that uses email-based OTP (One-Time Password) for user registration.

## Features

- **Frontend Pages**: 
  - `landingpage.html`: The entry point with signup/login capabilities.
  - `index.html`: The main dashboard/store view after authentication.
  - `produtpage.html`: A detailed product view template.
- **Backend**: Express.js server handling API requests.
- **Authentication**: 
  - User login (`/login`)
  - OTP generation and email dispatch for registration (`/send-otp`)
  - OTP verification to finalize account creation (`/verify-otp`)
- **Email Delivery**: Uses `nodemailer` with Ethereal Email (a fake SMTP service) to safely test sending OTP emails during development.
- **Data Storage**: User accounts are stored locally in a `users.json` file.

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

## Setup Instructions

1. **Install dependencies**:
   Run the following command in the project directory to install `express`, `cors`, and `nodemailer`.
   ```bash
   npm install
   ```

2. **Run the server**:
   Start the Node.js backend.
   ```bash
   node server.js
   ```

3. **Access the application**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
   By default, this will load `landingpage.html`.

## Testing the OTP System

Since the application uses Ethereal Email for development testing, actual emails are not sent to your real inbox. 

When you register a new account, check your terminal (where the Node server is running). You will see output similar to this:

```text
Message sent: <message-id>
Preview URL: https://ethereal.email/message/...
Generated OTP for your.email@example.com: 123456
```

You can either click the **Preview URL** to view the simulated email or simply copy the **Generated OTP** directly from the terminal to complete your registration.
