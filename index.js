const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Twilio
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/api/register-guest', async (req, res) => {
  console.log('--- INICIANDO PROCESSO DE REGISTRO ---');
  const { name, emails, phones } = req.body;
  console.log('Dados recebidos:', { name, emails, phones });

  // 1. Gerar link da chave (Simulado por enquanto)
  const keyLink = `https://provisioon-site.vercel.app/key.html?t=KEY_${Date.now()}`;

  try {
    let smsStatus = 'Não enviado';

    // 2. Tentar enviar SMS se houver telefone
    if (phones && phones.length > 0) {
      const phone = phones[0]; // Pega o primeiro número
      const formattedPhone = phone.startsWith('+') ? phone : `+1${phone}`;
      
      console.log(`Tentando enviar SMS para: ${formattedPhone}...`);
      
      const message = await client.messages.create({
        body: `Olá ${name}! Sua chave digital PROVISIOON está pronta. Acesse aqui: ${keyLink}`,
        from: process.env.TWILIO_FROM,
        to: formattedPhone
      });
      
      smsStatus = `Enviado (SID: ${message.sid})`;
      console.log('✅ SMS ENVIADO COM SUCESSO!');
    }

    // 3. Resposta final (Só chega aqui se não der erro no Twilio)
    res.json({ 
      success: true, 
      message: 'Hóspede registrado e SMS enviado!',
      details: { sms: smsStatus }
    });

  } catch (error) {
    console.error('❌ ERRO NO PROCESSO:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao enviar SMS. Verifique se o número é válido ou se a conta Twilio tem saldo.',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor PROVISIOON ativo na porta ${PORT}`));
