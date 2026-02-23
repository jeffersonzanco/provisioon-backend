# PROVISIOON - Smart Digital Key System

🔑 Sistema de chaves digitais inteligentes para hotéis e acomodações.

## 🚀 Deploy Status

- **Railway**: [![Railway](https://img.shields.io/badge/Railway-Deployed-success)](https://provisioon-backend-production-de74.up.railway.app)
- **Status**: ✅ Running

## 📋 Sobre o Projeto

Provisioon é um sistema backend para gerenciamento de chaves digitais, permitindo:
- Envio de chaves digitais por email (SendGrid)
- Envio de chaves digitais por SMS (Twilio)
- Interface web para administração
- Sistema de consentimento LGPD/GDPR

## 🛠️ Tecnologias

- **Node.js** (>=18.0.0)
- **Express.js** - Framework web
- **SendGrid** - Envio de emails
- **Twilio** - Envio de SMS
- **Railway** - Hospedagem

## 📦 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/jeffersonzanco/provisioon-backend.git
cd provisioon-backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# Inicie o servidor
npm start
```

## 🔧 Variáveis de Ambiente (Railway)

Configure as seguintes variáveis no Railway:

```env
# Railway define automaticamente
PORT=3000

# SendGrid (obrigatório para emails)
SENDGRID_API_KEY=SG.your_api_key_here

# Twilio (obrigatório para SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
# OU use Messaging Service (recomendado)
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxx
```

### Como obter as credenciais:

1. **SendGrid**:
   - Acesse: https://app.sendgrid.com/settings/api_keys
   - Crie uma nova API Key com permissões de envio

2. **Twilio**:
   - Acesse: https://console.twilio.com
   - Copie Account SID e Auth Token
   - Configure um número de telefone ou Messaging Service

## 🌐 Endpoints

### Públicos
- `GET /` - Landing page
- `GET /health` - Health check
- `GET /legal` - Política de privacidade e termos SMS
- `GET /admin` - Painel administrativo
- `GET /key.html` - Página da chave digital

### API
- `POST /api/send-key` - Envia chave digital por email/SMS
  ```json
  {
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "+5511999999999",
    "room": "101",
    "start": "2026-02-22T14:00",
    "end": "2026-02-25T12:00"
  }
  ```

- `POST /api/register-guest` - Registra hóspede (alias)

## 🐛 Troubleshooting

### Servidor crashando no Railway?

✅ **Correções aplicadas neste commit:**

1. **Graceful Shutdown**: Adicionado tratamento de SIGTERM/SIGINT
2. **Port Binding**: Servidor agora escuta em `0.0.0.0` (não apenas localhost)
3. **Error Handling**: Tratamento de erros não capturados
4. **Logging**: Logs detalhados para debug
5. **Engine Specification**: Node.js >=18.0.0 especificado

### Verificar logs no Railway:

```bash
# Você deve ver:
✓ SendGrid configured
✓ Twilio configured
Environment PORT: 3000
Using PORT: 3000
✓ Server is running on port 3000
✓ Health check: http://localhost:3000/health
✓ Server ready to accept connections
```

### Testar localmente:

```bash
npm start
# Abra: http://localhost:3000/health
# Deve retornar: ok
```

## 📝 Changelog

### v1.0.1 (2026-02-22)
- ✅ Fix: Railway SIGTERM crash
- ✅ Add: Graceful shutdown handling
- ✅ Add: Better error logging
- ✅ Add: Port binding to 0.0.0.0
- ✅ Add: Uncaught exception handling
- ✅ Update: README with troubleshooting

### v1.0.0 (2026-01-10)
- 🎉 Initial release

## 📄 Licença

MIT License - veja LICENSE para detalhes.

## 👤 Autor

**Jefferson Zanco**
- GitHub: [@jeffersonzanco](https://github.com/jeffersonzanco)

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs no Railway
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Teste o endpoint `/health`
4. Abra uma issue no GitHub

---

**Status**: ✅ Production Ready | **Version**: 1.0.1 | **Last Update**: 2026-02-22
