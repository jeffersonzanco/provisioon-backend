const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/api/register-guest', async (req, res) => {
  console.log('--- NOVA REQUISIÇÃO RECEBIDA ---');
  const { name, emails, phones } = req.body;
  
  const keyLink = `https://provisioon-site.vercel.app/key.html?t=KEY_${Date.now()}`;

  try {
    if (phones && phones.length > 0) {
      for (const phone of phones) {
        const formattedPhone = phone.startsWith('+') ? phone : `+1${phone}`;
        console.log(`Tentando enviar SMS para: ${formattedPhone}`);
        
        const message = await client.messages.create({
          body: `Olá ${name}! Sua chave PROVISIOON: ${keyLink}`,
          from: process.env.TWILIO_FROM,
          to: formattedPhone
        });
        console.log(`✅ SUCESSO TWILIO: SID ${message.sid}`);
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error('❌ ERRO NO TWILIO:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Motor rodando na porta ${PORT}`));
