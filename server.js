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

// Configurações oficiais PROVISIOON LLC
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/send-key', async (req, res) => {
    const { name, email, phone, room } = req.body;
    const keyUrl = `https://provisioon-backend-production-ad1d.up.railway.app/key.html?room=${room}`;

    try {
        const msg = {
            to: email,
            from: {
                email: 'keys@provisioon.com',
                name: '🔑 PROVISIOON'
            },
            replyTo: 'management@provisioon.com',
            subject: '🔑 Your PROVISIOON Digital Key',
            html: `
                <div style="font-family:sans-serif; max-width:500px; margin:auto; border:1px solid #eee; padding:20px; border-radius:15px; text-align:center;">
                    <h1 style="color:#001a33; font-size:24px;">Hello, ${name}!</h1>
                    <p style="font-size:16px; color:#333;">Your digital key for <strong>Room ${room}</strong> is ready for use.</p>
                    <div style="margin:35px 0;">
                        <a href="${keyUrl}" style="background:#00d4ff; color:white; padding:18px 35px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:18px; display:inline-block; box-shadow: 0 4px 15px rgba(0,212,255,0.3);">
                            OPEN DOOR NOW
                        </a>
                    </div>
                    <p style="font-size:13px; color:#888;">If the button above doesn't work, please use the link below:</p>
                    <p style="font-size:12px; color:#00d4ff; word-break:break-all;">${keyUrl}</p>
                    <hr style="border:none; border-top:1px solid #eee; margin:25px 0;">
                    <p style="font-size:11px; color:#aaa;">PROVISIOON LLC - Bradenton, FL<br>Secure Digital Access Systems</p>
                </div>
            `
        };
        await sgMail.send(msg);

        if (phone) {
            try {
                await twilioClient.messages.create({
                    body: `PROVISIOON: Hello ${name}! Your key for room ${room} is ready. Access it here: ${keyUrl}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phone
                });
            } catch (smsErr) {
                console.log('SMS log:', smsErr.message);
            }
        }

        res.status(200).json({ success: true, message: 'Professional Key Sent!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PROVISIOON Server Active on Port ${PORT}`));
