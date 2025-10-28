import axios from "axios";

export async function answerWithOpenAI(userText) {
  try {
    const r = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Você é o assistente contábil da Ohana Contabilidade. Responda de forma objetiva, educada e com passos claros. Quando aplicável, peça os dados necessários (CNPJ, período, valores)."
          },
          { role: "user", content: userText }
        ],
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    return r.data.choices?.[0]?.message?.content?.trim() || "Certo!";
  } catch (e) {
    console.error("OpenAI error:", e.response?.data || e.toString());
    return "Desculpe, não consegui processar a resposta agora.";
  }
}
