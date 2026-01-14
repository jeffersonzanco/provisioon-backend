const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/api/register-guest', async (req, res) => {
  const { name, emails, phones } = req.body;
  const keyLink = `https://provisioon-site.vercel.app/key.html?t=KEY_${Date.now()}`;

  try {
    if (emails && emails.length > 0) {
      await transporter.sendMail({
        from: `"PROVISIOON" <${process.env.EMAIL_USER}>`,
        to: emails[0],
        subject: "Sua Chave Digital PROVISIOON",
        html: `<h3>Olá ${name}!</h3><p>Sua chave digital está pronta.</p><a href="${keyLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">ABRIR PORTA VIRTUAL</a>`
      });
    }

    if (phones && phones.length > 0) {
      const formattedPhone = phones[0].startsWith('+') ? phones[0] : `+1${phones[0]}`;
      await client.messages.create({
        body: `Olá ${name}! Sua chave PROVISIOON: ${keyLink}`,
        from: process.env.TWILIO_FROM,
        to: formattedPhone
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
