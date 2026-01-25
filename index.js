const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

// Inicialização segura das APIs
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null;

app.get('/', (req, res) => res.send('Servidor PROVISIOON Ativo!'));

app.post('/api/register-guest', async (req, res) => {
  const { name, emails, phones } = req.body;
  const keyLink = `https://provisioon-site.vercel.app/key.html?t=KEY_${Date.now()}`;

  res.json({ success: true, message: 'Processando...' });

  try {
    if (resend && emails && emails.length > 0) {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: emails[0],
        subject: 'Sua Chave Digital PROVISIOON',
        html: `<strong>Olá ${name}!</strong><p>Sua chave: <a href="${keyLink}">ABRIR PORTA</a></p>`
      });
    }

    if (twilioClient && phones && phones.length > 0) {
      const to = phones[0].startsWith('+') ? phones[0] : `+1${phones[0]}`;
      await twilioClient.messages.create({
        body: `Olá ${name}! Sua chave PROVISIOON: ${keyLink}`,
        from: process.env.TWILIO_FROM,
        to: to
      });
    }
  } catch (err) {
    console.error('Erro no envio:', err.message);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
