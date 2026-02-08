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

// ROTA DE ENVIO (RECEPÇÃO)
app.post('/api/send-key', async (req, res) => {
    const { name, email, phone, room, start, end } = req.body;
    const keyUrl = `https://${req.get('host')}/key.html?room=${room}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&name=${encodeURIComponent(name)}`;

    try {
        await sgMail.send({
            to: email,
            from: { email: 'keys@provisioon.com', name: 'PROVISIOON' },
            subject: 'Your Digital Key - Room ' + room,
            html: `<div style="font-family:sans-serif;text-align:center;padding:20px;border:1px solid #eee;">
                    <h2>Hello ${name},</h2>
                    <p>Your key for <strong>Room ${room}</strong> is ready.</p>
                    <p>Valid until: ${new Date(end).toLocaleString()}</p>
                    <a href="${keyUrl}" style="background:#00d4ff;color:white;padding:15px 25px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;">OPEN DOOR NOW</a>
                   </div>`
        });
        if (phone) {
            await twilioClient.messages.create({
                body: `PROVISIOON: Key for room ${room} is ready. Access here: ${keyUrl}`,
                from: process.env.TWILIO_PHONE_NUMBER, to: phone
            });
        }
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ROTA DE ABERTURA (O QUE O BOTÃO CHAMA)
app.post('/api/unlock', (req, res) => {
    const { room, start, end } = req.body;
    const now = Date.now(); // Pega o tempo real agora em milissegundos

    // Comparação direta de números (o jeito mais seguro do mundo)
    if (now < Number(start)) {
        return res.status(403).json({ success: false, message: 'Access not active yet' });
    }
    if (now > Number(end)) {
        return res.status(403).json({ success: false, message: 'Access expired' });
    }

    console.log(`[UNLOCK] Room ${room} authorized!`);
    // Aqui enviaremos o comando para o ESP32 em breve
    res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server on port ${PORT}`));
