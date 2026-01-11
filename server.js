import express from 'express';
import cors from 'cors';
import twilio from 'twilio';

const app = express();
app.use(cors());
app.use(express.json());

// Configurações do Twilio (serão preenchidas no Render depois)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_FROM;
const client = twilio(accountSid, authToken);

// Rota para registrar hóspede e enviar SMS
app.post('/api/register-guest', async (req, res) => {
  const { name, phone } = req.body;
  
  // Criamos um link de teste (na quarta-feira geramos tokens reais)
  const keyLink = `https://provisioon-site.vercel.app/key.html?t=PROVISIOON_${Date.now()}`;

  try {
    // Envia o SMS via Twilio
    await client.messages.create({
      body: `Olá ${name}! Sua chave digital PROVISIOON está pronta: ${keyLink}`,
      from: twilioNumber,
      to: phone
    });

    console.log(`SMS enviado para ${name}`);
    res.json({ success: true, message: 'SMS enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota que o botão da chave vai chamar (OPEN/CLOSE)
app.post('/api/door/:action', (req, res) => {
  const { action } = req.params;
  console.log(`COMANDO RECEBIDO: Porta solicitada para ${action.toUpperCase()}`);
  
  // Aqui na quarta-feira conectamos o chip (ESP32)
  res.json({ success: true, message: `Comando ${action} enviado ao sistema.` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
