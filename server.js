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

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/key.html', (req, res) => res.sendFile(path.join(__dirname, 'key.html')));
app.get('/', (req, res) => res.send('PROVISIOON System Active'));

app.post('/api/send-key', async (req, res) => {
    const { name, email, phone, room } = req.body;
    const keyUrl = `https://${req.get('host')}/key.html?room=${room}`;
    try {
        await sgMail.send({
            to: email,
            from: 'keys@provisioon.com',
            subject: '🔑 Your PROVISIOON Key',
            html: `<h1>Hello ${name}</h1><p>Your key for room ${room}: <a href="${keyUrl}">OPEN DOOR</a></p>`
        });
        if (phone) {
            await twilioClient.messages.create({
                body: `PROVISIOON: Key for room ${room}: ${keyUrl}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server on port ${PORT}`));
