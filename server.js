// server.js
import "dotenv/config";
import express from "express";
import { handleIncoming } from "./flows/flow.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Chatbot Ohana rodando no Render!");
});

// Webhook de verificação (Meta/WhatsApp)
app.get("/webhook", (req, res) => {
  const verify = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === verify) return res.status(200).send(challenge);
  return res.sendStatus(403);
});

// Webhook de recebimento de mensagens (Meta/WhatsApp)
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (message) {
      const from = message.from;
      const text = message.text?.body || message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "";
      await handleIncoming(from, text);
    }

    res.sendStatus(200);
  } catch (e) {
    console.error("Webhook error:", e);
    res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
