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
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>PROVISIOON</title><style>body{margin:0;font-family:sans-serif;background:#000;color:#fff;}.hero{height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;background:linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)),url("https://images.unsplash.com/photo-1558002038-1055907df827");background-size:cover;}#pop{position:fixed;bottom:20px;left:20px;right:20px;background:#fff;color:#000;padding:20px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;max-width:1000px;margin:auto;}.btn{background:#00d4ff;color:#fff;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;font-weight:bold;}</style></head><body><div class="hero"><h1>PROVISIOON</h1><p>SMART ACCESS SOLUTIONS</p></div><div id="pop"><div>We use cookies for security and digital keys. By using this site you agree to our Privacy Policy.</div><button class="btn" onclick="document.getElementById(\'pop\').style.display=\'none\'">Accept</button></div></body></html>');
});

app.get('/legal', (req, res) => {
    res.send('<h1>Legal Information</h1><p>Privacy Policy: We collect data only for keys.</p><p>SMS Terms: You agree to receive keys via SMS.</p><a href="/">Back</a>');
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/key.html', (req, res) => res.sendFile(path.join(__dirname, 'key.html')));

app.post('/api/send-key', async (req, res) => {
    const { name, email, phone, room, start, end } = req.body;
    const host = req.get('host');
    const keyUrl = "https://" + host + "/key.html?room=" + room + "&start=" + start + "&end=" + end + "&name=" + encodeURIComponent(name);
    try {
        if (process.env.SENDGRID_API_KEY) {
            await sgMail.send({
                to: email,
                from: { email: 'keys@provisioon.com', name: 'PROVISIOON' },
                subject: 'Your Digital Key',
                html: '<h2>Hello ' + name + '</h2><p>Your key is ready.</p><a href="' + keyUrl + '">OPEN DOOR</a>'
            });
        }
        if (phone && twilioClient) {
            await twilioClient.messages.create({
                body: 'PROVISIOON: Your key is ready. Access: ' + keyUrl,
                messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
                to: phone
            });
        }
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log('Server Active'));
