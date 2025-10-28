# Deploy no Render.com (Zero dor de cabeça)

## 1) Crie o serviço no Render
- Faça login em https://render.com
- Clique em **New +** → **Web Service**
- Escolha **"Deploy an existing folder/archive"** (ou conecte ao seu GitHub)
- Envie este projeto (ZIP) ou selecione o repositório
- Render detectará Node e usará:
  - Build Command: `npm install`
  - Start Command: `npm start`

> Alternativa: mantenha este `render.yaml` e use **"Blueprints"**.

## 2) Defina as variáveis de ambiente (Environment → Add Environment Variable)
- VERIFY_TOKEN
- WHATSAPP_TOKEN
- PHONE_NUMBER_ID
- OPENAI_API_KEY
- PAUL_CERT_PFX (se usar PFX remoto, use valor do caminho no container; caso contrário, use PEM/KEY)
- PAUL_CERT_PASS
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- RH_EMAIL_TO, CONT_EMAIL_TO
- COMERCIAL_URL

> Dica: você pode subir o PFX como **Secret File** no Render e referenciar o caminho gerado.

## 3) Deploy
- Clique em **Create Web Service**
- Aguarde a build terminar. A URL pública ficará algo como: `https://ohana-whatsapp-chatbot.onrender.com`

## 4) Configure o Webhook no Meta Developers
- Vá em **WhatsApp → Configuration → Webhook**
- URL: `https://SEU-DOMINIO-DA-RENDER/webhook`
- VERIFY_TOKEN: o mesmo que você setou no Render
- **Subscribe** aos eventos `messages`

## 5) Teste
- Envie mensagem para seu número do WhatsApp Business
- O bot responderá com o menu (cliente? 1/2, serviços, etc.)

## Observações importantes
- O app já usa a variável `PORT` que o Render injeta automaticamente.
- Health check em `/` (responde "OK - Ohana WhatsApp Chatbot Online").
- Para produção São Paulo (Paulistana), implemente a **assinatura digital do XML** e as **consultas de lote**, como indicado no README principal.
