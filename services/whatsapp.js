import axios from "axios";

const WA_BASE = "https://graph.facebook.com/v17.0";

export async function sendText(to, body) {
  try {
    await axios.post(
      `${WA_BASE}/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (e) {
    console.error("WhatsApp send error:", e.response?.data || e.toString());
  }
}
