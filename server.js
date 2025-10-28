// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ Chatbot Ohana rodando no Render!');
});

// Webhook de verificação (Meta/WhatsApp)
app.get('/webhook', (req, res) => {
  const verify = process.env.VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === verify) return res.status(200).send(challenge);
  return res.sendStatus(403);
});
// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(🚀 Servidor rodando na porta ${PORT});
});
