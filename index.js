const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// Função para enviar SMS com segurança
async function sendSMS(name, phone) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!sid || !token || !from) {
    throw new Error("Faltam variáveis de ambiente do Twilio (SID, Token ou From)");
  }

  const client = twilio(sid, token);
  const formattedPhone = phone.startsWith('+') ? phone : `+1${phone}`;
  const keyLink = `https://provisioon-site.vercel.app/key.html?t=KEY_${Date.now()}`;

  return client.messages.create({
    body: `Olá ${name}! Sua chave digital PROVISIOON está pronta: ${keyLink}`,
    from: from,
    to: formattedPhone
  });
}

app.post('/api/register-guest', async (req, res) => {
  console.log('--- REQUISIÇÃO RECEBIDA ---');
  const { name, phones } = req.body;

  try {
    if (phones && phones.length > 0) {
      console.log(`Tentando enviar para ${phones[0]}...`);
      const message = await sendSMS(name, phones[0]);
      console.log(`✅ SUCESSO: SID ${message.sid}`);
      return res.json({ success: true, message: 'SMS enviado!' });
    }
    res.status(400).json({ success: false, error: 'Nenhum telefone fornecido' });
  } catch (error) {
    console.error('❌ ERRO NO PROCESSO:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
