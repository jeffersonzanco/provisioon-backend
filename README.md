# PROVISIOON Backend

Backend para o sistema de controle de acesso inteligente PROVISIOON. Este serviço gerencia o envio de chaves digitais via SMS usando a API Twilio.

## 🚀 Funcionalidades

- ✅ Envio de SMS com chaves de acesso via Twilio
- ✅ Validação de dados de entrada
- ✅ Health check endpoints
- ✅ Tratamento robusto de erros
- ✅ Logging detalhado
- ✅ Suporte a múltiplos telefones

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- Conta Twilio ativa
- Número de telefone Twilio configurado

## 🔧 Configuração

### Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no seu serviço:

```bash
TWILIO_ACCOUNT_SID=seu_account_sid_aqui
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_FROM=+1234567890  # Seu número Twilio
PORT=10000  # Opcional, padrão é 10000
```

### Instalação

```bash
npm install
```

### Execução Local

```bash
npm start
```

O servidor estará disponível em `http://localhost:10000`

## 📡 Endpoints

### GET `/`
Health check básico

**Resposta:**
```json
{
  "status": "online",
  "service": "PROVISIOON Backend",
  "timestamp": "2026-01-11T20:00:00.000Z"
}
```

### GET `/health`
Verificação de saúde detalhada

**Resposta:**
```json
{
  "status": "healthy",
  "twilio": "configured",
  "timestamp": "2026-01-11T20:00:00.000Z"
}
```

### POST `/api/register-guest`
Registra um convidado e envia SMS com chave de acesso

**Body:**
```json
{
  "name": "João Silva",
  "emails": ["joao@example.com"],
  "phones": ["+5511999999999", "+5511888888888"]
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Todos os SMS foram enviados com sucesso",
  "results": [
    {
      "phone": "+5511999999999",
      "success": true,
      "sid": "SM1234567890abcdef"
    }
  ]
}
```

**Resposta de Erro:**
```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

## 🔒 Segurança

- ✅ Validação de variáveis de ambiente obrigatórias
- ✅ Validação de dados de entrada
- ✅ Tratamento de erros em cada etapa
- ✅ CORS habilitado para comunicação segura

## 📦 Deploy no Render

### Passos:

1. **Conecte seu repositório GitHub** ao Render
2. **Configure as variáveis de ambiente**:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Deploy!**

### Verificação do Deploy:

Após o deploy, acesse `https://seu-servico.onrender.com/health` para verificar se está funcionando.

## 🐛 Troubleshooting

### Erro: "Variáveis de ambiente obrigatórias não configuradas"

**Solução**: Configure todas as variáveis de ambiente necessárias no painel do Render:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_FROM

### Erro: "Erro ao inicializar cliente Twilio"

**Solução**: Verifique se suas credenciais Twilio estão corretas.

### SMS não está sendo entregue

**Possíveis causas**:
1. Número de telefone não verificado na conta Twilio (contas trial)
2. Formato incorreto do número de telefone
3. Saldo insuficiente na conta Twilio
4. Número Twilio não configurado para enviar SMS

## 📝 Logs

O servidor fornece logs detalhados para facilitar o debugging:

```
=================================
🚀 PROVISIOON Backend INICIADO
📡 Porta: 10000
🕐 Timestamp: 2026-01-11T20:00:00.000Z
=================================
--- NOVA REQUISIÇÃO RECEBIDA ---
📱 Tentando enviar SMS para: +5511999999999
✅ SMS enviado com sucesso!
   SID: SM1234567890abcdef
   Status: queued
```

## 🤝 Contribuindo

Sinta-se à vontade para contribuir com melhorias!

## 📄 Licença

ISC

## 👨‍💻 Autor

Jefferson Zanco
