const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/register-guest', (req, res) => {
    console.log('Dados recebidos:', req.body);
    // Aqui depois vamos ligar o Twilio e o MQTT
    res.status(200).json({ message: 'Hóspede registrado com sucesso (Modo Teste)!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Motor rodando na porta ${PORT}`));
