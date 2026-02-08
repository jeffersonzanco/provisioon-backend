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

// Configuração das APIs
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Rotas de Páginas
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/key.html', (req, res) => res.sendFile(path.join(__dirname, 'key.html')));
app.get('/', (req, res) => res.send('PROVISIOON System Active'));

// ROTA DE ENVIO (RECEPÇÃO)
app.post('/api/send-key', async (req, res) => {
    const { name, email, phone, room, start, end } = req.body;
    
    const keyUrl = `https://${req.get('host')}/key.html?room=${room}&start=${start}&end=${end}&name=${encodeURIComponent(name)}`;

    try {
        // Envio de E-mail
        await sgMail.send({
            to: email,
            from: { email: 'keys@provisioon.com', name: 'PROVISIOON' },
            subject: 'Your Digital Key - Room ' + room,
            html: `<div style="font-family:sans-serif;text-align:center;padding:20px;border:1px solid #eee;">
                    <h2>Hello ${name},</h2>
                    <p>Your key for <strong>Room ${room}</strong> is ready.</p>
                    <div style="margin:20px 0;">
                        <a href="${keyUrl}" style="background:#00d4ff;color:white;padding:15px 25px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;">OPEN DOOR NOW</a>
                    </div>
                    <p style="font-size:10px;color:#999;">PROVISIOON LLC - Secure Access System</p>
                   </div>`
        });

        // Envio de SMS
        if (phone) {
            await twilioClient.messages.create({
                body: `PROVISIOON: Hello ${name}! Your digital key for Room ${room} is ready. Access: ${keyUrl}`,
                messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
                to: phone
            });
        }
        
        res.status(200).json({ success: true });
    } catch (error) { 
        console.error('Error:', error.message);
        res.status(500).json({ success: false, message: error.message }); 
    }
});

// ROTA DE ABERTURA (SEGURANÇA)
app.post('/api/unlock', (req, res) => {
    const { room, start, end } = req.body;
    const now = Date.now();

    if (now < Number(start)) {
        return res.status(403).json({ success: false, message: 'Access not active yet' });
    }
    if (now > Number(end)) {
        return res.status(403).json({ success: false, message: 'Access expired' });
    }

    console.log(`[UNLOCK] Room ${room} authorized!`);
    res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server on port ${PORT}`));
