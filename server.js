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

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// PÁGINA INICIAL COM TEXTOS LEGAIS (Para aprovação do Twilio)
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>PROVISIOON - Digital Key System</title>
            </head>
            <body style="font-family:sans-serif; padding:40px; line-height:1.6; max-width:800px; margin:auto;">
                <h1>PROVISIOON Digital Key System</h1>
                <p>Welcome to the secure access portal of Provisioon LLC.</p>
                <hr>
                <h3>Privacy Policy</h3>
                <p>Provisioon LLC ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose your personal information.</p>
                <p><strong>Information We Collect:</strong> We collect your name, email address, and phone number only when provided by you or the hotel administration to generate your digital access key.</p>
                <p><strong>How We Use Your Information:</strong> We use your phone number solely to send you your digital room key and check-in instructions via SMS. We do not share your personal data with third parties for marketing purposes.</p>
                <p><strong>Data Security:</strong> We implement industry-standard security measures to protect your data.</p>
                <p><strong>Contact Us:</strong> If you have questions, contact us at support@provisioon.com.</p>
                <hr>
                <h3>Terms and Conditions</h3>
                <p>By providing your phone number, you agree to receive text messages from Provisioon LLC regarding your digital room key and hotel stay.</p>
                <p><strong>Message Frequency:</strong> Message frequency varies based on your hotel stay and requests.</p>
                <p><strong>Rates:</strong> Message and data rates may apply.</p>
                <p><strong>Opt-out:</strong> You can cancel the SMS service at any time. Just text "STOP" to the number you received the message from. After you send the SMS message "STOP" to us, we will send you an SMS message to confirm that you have been unsubscribed.</p>
                <p><strong>Help:</strong> If you are experiencing issues with the messaging program you can reply with the keyword HELP for more assistance.</p>
            </body>
        </html>
    `);
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/key.html', (req, res) => res.sendFile(path.join(__dirname, 'key.html')));

app.post('/api/send-key', async (req, res) => {
    const { name, email, phone, room, start, end } = req.body;
    const keyUrl = `https://${req.get('host')}/key.html?room=${room}&start=${start}&end=${end}&name=${encodeURIComponent(name)}`;
    try {
        await sgMail.send({
            to: email,
            from: { email: 'keys@provisioon.com', name: 'PROVISIOON' },
            subject: 'Your Digital Key - Room ' + room,
            html: `<div style="text-align:center;padding:20px;border:1px solid #eee;">
                    <h2>Hello ${name},</h2>
                    <p>Your key for <strong>Room ${room}</strong> is ready.</p>
                    <a href="${keyUrl}" style="background:#00d4ff;color:white;padding:15px 25px;text-decoration:none;border-radius:5px;display:inline-block;">OPEN DOOR NOW</a>
                   </div>`
        });
        if (phone) {
            await twilioClient.messages.create({
                body: `PROVISIOON: Hello ${name}! Your digital key for Room ${room} is ready. Access: ${keyUrl}`,
                messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
                to: phone
            });
        }
        res.status(200).json({ success: true });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
});

app.post('/api/unlock', (req, res) => {
    const { room, start, end } = req.body;
    const now = Date.now();
    if (now < Number(start) || now > Number(end)) return res.status(403).json({ success: false, message: 'Access expired or not active' });
    res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server on port ${PORT}`));
