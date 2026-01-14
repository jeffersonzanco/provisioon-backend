const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/api/register-guest', async (req, res) => {
  const { name, emails, phones } = req.body;
  const keyLink = `https://provisioon-site.vercel.app/key.html?t=KEY_${Date.now()}`;

  // Responde ao site na hora para não travar o botão
  res.json({ success: true, message: 'Enviando chaves...' });

  // Envia o e-mail e SMS em segundo plano
  (async () => {
    try {
      if (emails && emails.length > 0) {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: emails[0],
          subject: 'Sua Chave Digital PROVISIOON',
          html: `<strong>Olá ${name}!</strong><p>Sua chave digital está pronta: <a href="${keyLink}">ABRIR PORTA</a></p>`
        });
        console.log('✅ E-mail enviado via Resend');
      }

      if (phones && phones.length > 0) {
        const formattedPhone = phones[0].startsWith('+') ? phones[0] : `+1${phones[0]}`;
        await client.messages.create({
          body: `Olá ${name}! Sua chave PROVISIOON: ${keyLink}`,
          from: process.env.TWILIO_FROM,
          to: formattedPhone
        });
        console.log('✅ SMS enviado via Twilio');
      }
    } catch (err) {
      console.error('❌ Erro no envio:', err.message);
    }
  })();
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor ativo na porta ${PORT}`));
