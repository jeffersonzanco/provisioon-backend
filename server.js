const express = require('express');
const path = require('path');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const cors = require('cors');
const mqtt = require('mqtt');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Configurações de API
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Conexão com a Fechadura (MQTT)
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

// SITE PRINCIPAL COM POP-UP DE PRIVACIDADE PROFISSIONAL
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PROVISIOON - Smart Access</title>
            <style>
                body { margin: 0; font-family: sans-serif; background: #000; color: white; overflow-x: hidden; }
                .hero { 
                    height: 100vh; 
                    background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070'); 
                    background-size: cover; background-position: center;
                    display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;
                }
                h1 { font-size: 4rem; margin: 0; letter-spacing: 4px; }
                p { font-size: 1.2rem; opacity: 0.7; margin-top: 10px; }
                
                /* POP-UP DE PRIVACIDADE ESTILO PROFISSIONAL */
                #privacy-popup {
                    position: fixed; bottom: 20px; left: 20px; right: 20px;
                    background: white; color: #222; padding: 20px;
                    border-radius: 12px; display: flex; justify-content: space-between;
                    align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    z-index: 10000; transition: 0.5s; max-width: 1100px; margin: auto;
                }
                .popup-text { font-size: 14px; padding-right: 20px; }
                .popup-btns { display: flex; gap: 10px; }
                .btn-accept { background: #00d4ff; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; }
                .btn-legal { background: #eee; color: #555; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 14px; }
                .hidden { display: none !important; }
            </style>
        </head>
        <body>
            <div class="hero">
                <h1>PROVISIOON</h1>
                <p>SMART ACCESS SOLUTIONS</p>
            </div>

            <div id="privacy-popup">
                <div class="popup-text">
                    We use cookies to ensure you get the best experience and to manage your digital keys securely. 
                    By clicking "Accept", you agree to our <strong>Privacy Policy</strong> and <strong>SMS Terms</strong>.
                </div>
                <div class="popup-btns">
                    <a href="/legal" class="btn-legal">View Terms</a>
                    <button class="btn-accept" onclick="accept()">Accept</button>
                </div>
            </div>

            <script>
                function accept() {
                    document.getElementById('privacy-popup').classList.add('hidden');
                    localStorage.setItem('provisioon_privacy', 'accepted');
                }
                if(localStorage.getItem('provisioon_privacy') === 'accepted') {
                    document.getElementById('privacy-popup').classList.add('hidden');
                }
            </script>
        </body>
        </html>
    `);
});

// PÁGINA LEGAL PARA O AUDITOR DO TWILIO
app.get('/legal', (req, res) => {
    res.send(`
        <body style="font-family:sans-serif; padding:50px; line-height:1.6; max-width:800px; margin:auto;">
            <h2>Legal Information</h2>
            <hr>
            <h4>Privacy Policy</h4>
            <p>We collect name and phone numbers only for digital key generation. Data is never shared.</p>
            <h4>SMS Terms</h4>
            <p>By providing your phone, you agree to receive access keys via SMS. Reply STOP to opt-out.</p>
            <br><a href="/">Return to Home</a>
        </body>
    `);
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/key.html', (req, res) => res.sendFile(path.join(__dirname, 'key.html')));

app.post('/api/send-key', async (req, res) => {
    const { name, email, phone, room, start, end } = req.body;
    const host = req.get('host');
    const keyUrl = \`https://\${host}/key.html?room=\${room}&start=\${start}&end=\${end}&name=\${encodeURIComponent(name)}\`;
    try {
        await sgMail.send({
            to: email,
            from: { email: 'keys@provisioon.com', name: 'PROVISIOON' },
            subject: 'Your Digital Key - Room ' + room,
            html: \`<div style="text-align:center;padding:20px;border:1px solid #eee;"><h2>Hello \${name},</h2><p>Your key for <strong>Room \${room}</strong> is ready.</p><a href="\${keyUrl}" style="background:#00d4ff;color:white;padding:15px 25px;text-decoration:none;border-radius:5px;display:inline-block;">OPEN DOOR NOW</a></div>\`
        });
        if (phone && twilioClient) {
            await twilioClient.messages.create({
                body: \`PROVISIOON: Hello \${name}! Your digital key for Room \${room} is ready. Access: \${keyUrl}\`,
                messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
                to: phone
            });
        }
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.post('/api/unlock', (req, res) => {
    const { room, start, end } = req.body;
    const now = Date.now();
    if (now < Number(start) || now > Number(end)) return res.status(403).json({ success: false, message: 'Expired' });
    mqttClient.publish(\`provisioon/hotel/room\${room}/unlock\`, 'OPEN');
    res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log('Server Active'));
