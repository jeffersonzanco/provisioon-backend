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
    const { name, email, phone, room, start, end } = req.body;
    
    // Criamos o link da chave com as datas de validade embutidas
    const keyUrl = `https://${req.get('host')}/key.html?room=${room}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&name=${encodeURIComponent(name)}`;

    try {
        await sgMail.send({
            to: email,
            from: { email: 'keys@provisioon.com', name: 'PROVISIOON' },
            subject: 'Your Digital Key - Room ' + room,
            html: `
                <div style="font-family:sans-serif; padding:20px; text-align:center; border:1px solid #eee; border-radius:10px;">
                    <h2>Hello ${name},</h2>
                    <p>Your digital key for <strong>Room ${room}</strong> is ready.</p>
                    <p style="font-size:14px; color:#666;">Valid from: ${new Date(start).toLocaleString()}<br>Until: ${new Date(end).toLocaleString()}</p>
                    <div style="margin:30px 0;">
                        <a href="${keyUrl}" style="background:#00d4ff; color:white; padding:15px 30px; text-decoration:none; border-radius:5px; font-weight:bold; display:inline-block;">OPEN DOOR NOW</a>
                    </div>
                    <p style="font-size:10px; color:#ccc;">PROVISIOON LLC - Secure Access System</p>
                </div>
            `
        });

        if (phone) {
            await twilioClient.messages.create({
                body: `PROVISIOON: Hello ${name}! Your key for room ${room} is ready. Valid until ${new Date(end).toLocaleString()}. Access here: ${keyUrl}`,
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
