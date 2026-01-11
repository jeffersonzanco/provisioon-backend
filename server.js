import express from 'express';
import cors from 'cors';
import twilio from 'twilio';

const app = express();
app.use(cors());
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_FROM;
const client = twilio(accountSid, authToken);

app.post('/api/register-guest', async (req, res) => {
  const { name, emails, phones } = req.body;
  
  // Criamos o link único da chave para este quarto
  const keyLink = `https://provisioon-site.vercel.app/key.html?t=PROVISIOON_${Date.now()}`;

  try {
    // Enviar SMS para todos os números da lista
    if (phones && phones.length > 0) {
      for (const phone of phones) {
        await client.messages.create({
          body: `Olá ${name}! Sua chave digital PROVISIOON está pronta: ${keyLink}`,
          from: twilioNumber,
          to: phone
        });
        console.log(`SMS enviado para ${phone}`);
      }
    }

    // Aqui futuramente entra o SendGrid para os emails
    if (emails && emails.length > 0) {
      console.log(`Emails registrados para envio: ${emails.join(', ')}`);
    }

    res.json({ success: true, message: 'Chaves enviadas com sucesso!' });
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/door/:action', (req, res) => {
  const { action } = req.params;
  console.log(`COMANDO RECEBIDO: Porta solicitada para ${action.toUpperCase()}`);
  res.json({ success: true, message: `Comando ${action} enviado.` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
