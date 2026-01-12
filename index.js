const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

// Validação de variáveis de ambiente obrigatórias
const requiredEnvVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ ERRO: Variáveis de ambiente obrigatórias não configuradas:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nConfigure essas variáveis no painel do Render e reinicie o serviço.');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// Inicialização do cliente Twilio
let client;
try {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('✅ Cliente Twilio inicializado com sucesso');
} catch (error) {
  console.error('❌ ERRO ao inicializar cliente Twilio:', error.message);
  process.exit(1);
}

// Health check endpoint para o Render
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'PROVISIOON Backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    twilio: 'configured',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para registrar convidado e enviar SMS
app.post('/api/register-guest', async (req, res) => {
  console.log('--- NOVA REQUISIÇÃO RECEBIDA ---');
  console.log('Timestamp:', new Date().toISOString());
  
  const { name, emails, phones } = req.body;
  
  // Validação de dados recebidos
  if (!name || !phones || phones.length === 0) {
    console.log('❌ Dados inválidos:', { name, emails, phones });
    return res.status(400).json({ 
      success: false, 
      error: 'Nome e pelo menos um telefone são obrigatórios' 
    });
  }
  
  console.log('Dados recebidos:', { name, emails, phones });
  
  const keyLink = `https://provisioon-site.vercel.app/key.html?t=KEY_${Date.now()}`;

  try {
    const results = [];
    
    for (const phone of phones) {
      // Garante que o número tenha o código do país
      const formattedPhone = phone.startsWith('+') ? phone : `+1${phone}`;
      
      console.log(`📱 Tentando enviar SMS para: ${formattedPhone}`);
      console.log(`   Usando número Twilio: ${process.env.TWILIO_FROM}`);
      
      try {
        const message = await client.messages.create({
          body: `Olá ${name}! Sua chave PROVISIOON: ${keyLink}`,
          from: process.env.TWILIO_FROM,
          to: formattedPhone
        });
        
        console.log(`✅ SMS enviado com sucesso!`);
        console.log(`   SID: ${message.sid}`);
        console.log(`   Status: ${message.status}`);
        
        results.push({
          phone: formattedPhone,
          success: true,
          sid: message.sid
        });
      } catch (phoneError) {
        console.error(`❌ Erro ao enviar SMS para ${formattedPhone}:`, phoneError.message);
        results.push({
          phone: formattedPhone,
          success: false,
          error: phoneError.message
        });
      }
    }
    
    const allSuccess = results.every(r => r.success);
    
    if (allSuccess) {
      res.json({ 
        success: true,
        message: 'Todos os SMS foram enviados com sucesso',
        results 
      });
    } else {
      res.status(207).json({ 
        success: false,
        message: 'Alguns SMS falharam',
        results 
      });
    }
  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.path 
  });
});

// Tratamento de erros globais
app.use((err, req, res, next) => {
  console.error('❌ ERRO NÃO TRATADO:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log('🚀 PROVISIOON Backend INICIADO');
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
  console.log('=================================');
});
