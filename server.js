const express = require('express');
const path = require('path');
const fs = require('fs');

const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // forms HTML
app.use(cors());
app.use(express.static(__dirname));

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (e) {
  console.log('Twilio init failed (ignored):', e.message);
}

function injectConsentBanner(html) {
  // evita duplicar se você já tiver um banner no HTML
  if (html.includes('id="provisioon-consent"')) return html;

  const banner = `
<div id="provisioon-consent" style="position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;background:#ffffff;color:#111;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.25);padding:16px;display:flex;gap:12px;align-items:center;justify-content:space-between;max-width:1100px;margin:0 auto;">
  <div style="font:14px/1.35 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;">
    We use cookies for security and to manage digital keys. By using this site you agree to our
    <a href="/legal" style="color:#0aa7c6;font-weight:600;text-decoration:none;">Privacy Policy & SMS Terms</a>.
  </div>
  <button id="provisioon-accept" style="background:#00d4ff;border:none;color:white;padding:10px 18px;border-radius:10px;font-weight:700;cursor:pointer;">
    Accept
  </button>
</div>
<script>
(function(){
  try {
    if (localStorage.getItem('provisioon_consent') === 'ok') {
      var b = document.getElementById('provisioon-consent');
      if (b) b.remove();
      return;
    }
    var btn = document.getElementById('provisioon-accept');
    if (btn) btn.addEventListener('click', function(){
      localStorage.setItem('provisioon_consent','ok');
      var b = document.getElementById('provisioon-consent');
      if (b) b.remove();
    });
  } catch(e) {}
})();
</script>
`;

  // injeta antes do </body> se existir; senão, no final
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, banner + '\n</body>');
  return html + banner;
}

app.get('/health', (req, res) => res.status(200).send('ok'));

app.get('/', (req, res) => {
  try {
    const landingPath = path.join(__dirname, 'landing.html');
    let html = fs.readFileSync(landingPath, 'utf8');
    html = injectConsentBanner(html);
    res.set('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    // NÃO CRASHA: mostra página de fallback
    return res
      .status(200)
      .send(
        `<h2>PROVISIOON</h2>
         <p>landing.html not found yet.</p>
         <p>Create a file named <b>landing.html</b> in the GitHub repo root and paste your Manus IA landing HTML.</p>
         <p>Error: ${String(e.message || e)}</p>`
      );
  }
});

app.get('/legal', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(`
  <body style="font-family:Arial,sans-serif;padding:40px;line-height:1.6;max-width:900px;margin:auto;">
    <h1>Privacy Policy & SMS Terms</h1>
    <h3>Privacy Policy</h3>
    <p>We collect name, email, and phone number only to generate and deliver digital access keys. We do not sell your personal data.</p>
    <h3>SMS Terms</h3>
    <p>By providing your phone number, you agree to receive SMS related to your digital room key and stay. Msg & data rates may apply.</p>
    <p><b>Opt-out:</b> Reply STOP to unsubscribe.</p>
    <p><b>Help:</b> Reply HELP for assistance.</p>
    <p>Contact: support@provisioon.com</p>
    <p><a href="/" style="color:#0aa7c6;text-decoration:none;">Back to site</a></p>
  </body>
  `);
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/key.html', (req, res) => res.sendFile(path.join(__dirname, 'key.html')));

// (Opcional) alias caso a landing da Manus chame /api/register-guest
app.post('/api/register-guest', (req, res) => {
  return res.status(200).json({ success: true });
});

app.post('/api/send-key', async (req, res) => {
  const { name, email, phone, room, start, end } = req.body;
  const host = req.get('host');
  const keyUrl =
    'https://' +
    host +
    '/key.html?room=' +
    encodeURIComponent(room || '') +
    '&start=' +
    encodeURIComponent(start || '') +
    '&end=' +
    encodeURIComponent(end || '') +
    '&name=' +
    encodeURIComponent(name || '');

  try {
    if (process.env.SENDGRID_API_KEY && email) {
      await sgMail.send({
        to: email,
        from: { email: 'keys@provisioon.com', name: 'PROVISIOON' },
        subject: 'Your Digital Key',
        html:
          '<h2>Hello ' +
          (name || '') +
          '</h2><p>Your key is ready.</p><p><a href="' +
          keyUrl +
          '">OPEN DOOR</a></p>',
      });
    }

    if (twilioClient && phone) {
      const msg = {
        body: 'PROVISIOON: Your key is ready. Access: ' + keyUrl,
        to: phone,
      };

      if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
        msg.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
      } else if (process.env.TWILIO_PHONE_NUMBER) {
        msg.from = process.env.TWILIO_PHONE_NUMBER;
      }

      // só envia se tiver "from" ou "messagingServiceSid"
      if (msg.from || msg.messagingServiceSid) {
        await twilioClient.messages.create(msg);
      }
    }

    return res.status(200).json({ success: true, keyUrl });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || String(error) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log('Server Active on port ' + PORT));
