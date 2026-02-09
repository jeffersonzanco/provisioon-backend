const express = require('express');
const path = require('path');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

if (process.env.SENDGRID_API_KEY) sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PROVISIOON - Smart Digital Key System</title>
    <style>
         { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header { text-align: center; padding: 60px 20px; }
        h1 { font-size: 3.5rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .tagline { font-size: 1.3rem; opacity: 0.9; margin-bottom: 40px; }
        .hero { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 50px; margin: 40px 0; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin: 50px 0; }
        .feature-card { background: rgba(255,255,255,0.15); padding: 30px; border-radius: 15px; text-align: center; transition: transform 0.3s; }
        .feature-card:hover { transform: translateY(-10px); }
        .cta-button { background: #00d4ff; color: white; border: none; padding: 15px 40px; font-size: 1.1rem; border-radius: 50px; cursor: pointer; margin: 20px 10px; transition: all 0.3s; }
        .cta-button:hover { background: #00b8e6; transform: scale(1.05); }
        footer { text-align: center; padding: 40px; opacity: 0.8; }
        
        #privacy-popup { position: fixed; bottom: 20px; left: 20px; right: 20px; background: white; color: #333; padding: 25px; border-radius: 15px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 10000; max-width: 1100px; margin: 0 auto; }
        .popup-text { font-size: 14px; line-height: 1.6; padding-right: 20px; }
        .popup-text strong { color: #667eea; }
        .btn-accept { background: #00d4ff; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px; transition: all 0.3s; }
        .btn-accept:hover { background: #00b8e6; transform: scale(1.05); }
        .hidden { display: none !important; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔐 PROVISIOON</h1>
            <p class="tagline">Next-Generation Smart Digital Key System</p>
        </header>

        <div class="hero">
            <h2 style="text-align:center; margin-bottom:30px;">Revolutionize Your Access Control</h2>
            <p style="text-align:center; font-size:1.1rem; line-height:1.8;">
                Say goodbye to physical keys and cards. PROVISIOON delivers secure, time-limited digital keys 
                directly to your guests via email and SMS. Perfect for hotels, Airbnb, offices, and smart homes.
            </p>
            <div style="text-align:center; margin-top:30px;">
                <button class="cta-button" onclick="window.location.href='/admin'">Admin Panel</button>
                <button class="cta-button" onclick="alert('Contact: support@provisioon.com')">Get Started</button>
            </div>
        </div>

        <div class="features">
            <div class="feature-card">
                <h3>📧 Email & SMS Delivery</h3>
                <p>Instant key delivery to your guests</p>
            </div>
            <div class="feature-card">
                <h3>⏰ Time-Limited Access</h3>
                <p>Keys expire automatically</p>
            </div>
            <div class="feature-card">
                <h3>🔒 Bank-Level Security</h3>
                <p>Encrypted end-to-end</p>
            </div>
            <div class="feature-card">
                <h3>📱 Mobile-First Design</h3>
                <p>Works on any device</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2026 PROVISIOON LLC. All rights reserved.
