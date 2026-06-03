# OHANA BOT — Módulo 5: Evolution API (WhatsApp)

---

## O QUE É A EVOLUTION API?

A Evolution API é uma ferramenta que "finge" ser o WhatsApp Web no servidor. Com ela, você consegue:
- Enviar mensagens de texto
- Enviar PDFs e imagens
- Receber mensagens
- Tudo isso sem pagar pelo WhatsApp Business API oficial

**Importante:** Use com seu número pessoal ou um número dedicado para o escritório.

---

## OPÇÃO 1 — Instalar no Render.com (GRATUITO, RECOMENDADO)

### PASSO 1 — Criar conta no Render

1. Acesse: **https://render.com**
2. Clique em **"Get Started for Free"**
3. Faça login com GitHub

### PASSO 2 — Criar o serviço da Evolution API

1. Clique em **"New +"** → **"Web Service"**
2. Selecione **"Deploy an existing image from a registry"**
3. Preencha:
   - **Image URL**: `atendai/evolution-api:latest`
   - **Name**: `ohana-evolution-api`
   - **Plan**: Free
4. Em **"Environment Variables"**, clique **"Add Environment Variable"** e adicione:

| Chave | Valor |
|---|---|
| `AUTHENTICATION_TYPE` | `apikey` |
| `AUTHENTICATION_API_KEY` | `ohana_super_secreto_2025` (crie uma senha forte) |
| `AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES` | `true` |
| `DEL_INSTANCE` | `false` |
| `DATABASE_ENABLED` | `false` |
| `REDIS_ENABLED` | `false` |
| `WEBHOOK_GLOBAL_ENABLED` | `false` |
| `CONFIG_SESSION_PHONE_CLIENT` | `Ohana Bot` |

5. Clique em **"Create Web Service"**
6. Aguarde 3-5 minutos para o deploy completar
7. **Anote a URL** gerada (ex: `https://ohana-evolution-api.onrender.com`)

---

## OPÇÃO 2 — Instalar no Railway.app

1. Acesse: **https://railway.app**
2. Crie conta com GitHub
3. Clique em **"New Project"** → **"Deploy from Docker Image"**
4. Image: `atendai/evolution-api:latest`
5. Adicione as mesmas variáveis de ambiente da Opção 1
6. A URL será gerada automaticamente

---

## PASSO 3 — Criar uma Instância (seu número de WhatsApp)

Após a Evolution API estar rodando, você precisa criar uma "instância" que representa seu número.

### Usando o Swagger UI (interface visual):

1. Acesse: `https://SUA-EVOLUTION-API/manager` ou `https://SUA-EVOLUTION-API/docs`
2. Você verá a documentação da API
3. Encontre o endpoint **POST /instance/create**
4. Clique em **"Try it out"**
5. Cole o seguinte JSON:
```json
{
  "instanceName": "ohana-bot",
  "token": "meu_token_ohana_2025",
  "qrcode": true,
  "integration": "WHATSAPP-BAILEYS"
}
```
6. Clique em **"Execute"**
7. Na resposta, você verá um **QR Code em base64**

### Alternativa — Usando o Insomnia ou Postman:

**POST** `https://SUA-EVOLUTION-API/instance/create`

Headers:
```
apikey: ohana_super_secreto_2025
Content-Type: application/json
```

Body:
```json
{
  "instanceName": "ohana-bot",
  "token": "meu_token_ohana_2025",
  "qrcode": true,
  "integration": "WHATSAPP-BAILEYS"
}
```

---

## PASSO 4 — Conectar o WhatsApp (Escanear QR Code)

1. Faça uma requisição **GET** para:
   `https://SUA-EVOLUTION-API/instance/connect/ohana-bot`
   
   Headers: `apikey: ohana_super_secreto_2025`

2. Na resposta, você receberá um QR Code
3. **No celular**, abra o WhatsApp → Menu (3 pontinhos) → Dispositivos Conectados → Conectar Dispositivo
4. Escaneie o QR Code
5. Pronto! Seu WhatsApp está conectado!

### Verificar se está conectado:

**GET** `https://SUA-EVOLUTION-API/instance/fetchInstances`

Headers: `apikey: ohana_super_secreto_2025`

A resposta deve mostrar `"state": "open"` — isso significa CONECTADO.

---

## PASSO 5 — Testar o Envio de Mensagem

Vamos testar enviando uma mensagem de texto:

**POST** `https://SUA-EVOLUTION-API/message/sendText/ohana-bot`

Headers:
```
apikey: ohana_super_secreto_2025
Content-Type: application/json
```

Body:
```json
{
  "number": "5511999999999",
  "text": "Olá! Este é um teste do OHANA BOT! 🎉"
}
```

Substitua `5511999999999` pelo seu próprio número para testar.
Formato: `55` (Brasil) + DDD + número (sem espaços, traços ou parênteses).

---

## COMO ENVIAR PDF (Documentos)

**POST** `https://SUA-EVOLUTION-API/message/sendMedia/ohana-bot`

Headers:
```
apikey: ohana_super_secreto_2025
Content-Type: application/json
```

Body:
```json
{
  "number": "5511999999999",
  "mediatype": "document",
  "mimetype": "application/pdf",
  "media": "https://URL-DO-PDF-NO-SUPABASE.pdf",
  "fileName": "DARF_Janeiro_2025.pdf",
  "caption": "DARF - Janeiro/2025 - Vencimento: 31/01/2025"
}
```

---

## COMO ENVIAR IMAGEM

```json
{
  "number": "5511999999999",
  "mediatype": "image",
  "mimetype": "image/jpeg",
  "media": "https://URL-DA-IMAGEM.jpg",
  "caption": "Comprovante de pagamento"
}
```

---

## CONFIGURAR WEBHOOK (Receber mensagens dos clientes)

O webhook permite que a Evolution API avise o n8n quando um cliente responder.

### No n8n, criar o Fluxo "Receber Resposta do Cliente":

1. **Webhook Node** no n8n
   - Path: `receber-whatsapp`
   - URL gerada: `https://SEU-N8N/webhook/receber-whatsapp`

2. **Configurar webhook na Evolution API:**

**POST** `https://SUA-EVOLUTION-API/webhook/set/ohana-bot`

Headers: `apikey: ohana_super_secreto_2025`

Body:
```json
{
  "url": "https://SEU-N8N/webhook/receber-whatsapp",
  "webhook_by_events": false,
  "webhook_base64": false,
  "events": [
    "MESSAGES_UPSERT",
    "MESSAGES_UPDATE",
    "SEND_MESSAGE"
  ]
}
```

---

## TABELA COMPLETA DE ENDPOINTS ÚTEIS

| Ação | Método | Endpoint |
|---|---|---|
| Criar instância | POST | `/instance/create` |
| Conectar (QR Code) | GET | `/instance/connect/ohana-bot` |
| Ver status | GET | `/instance/fetchInstances` |
| Desconectar | DELETE | `/instance/logout/ohana-bot` |
| Enviar texto | POST | `/message/sendText/ohana-bot` |
| Enviar PDF/mídia | POST | `/message/sendMedia/ohana-bot` |
| Enviar áudio | POST | `/message/sendWhatsAppAudio/ohana-bot` |
| Configurar webhook | POST | `/webhook/set/ohana-bot` |
| Ver chats | GET | `/chat/findChats/ohana-bot` |

---

## SOLUÇÃO DE PROBLEMAS COMUNS

### "QR Code expirado"
- O QR Code expira em ~30 segundos
- Chame novamente GET `/instance/connect/ohana-bot` para gerar um novo

### "WhatsApp desconectou"
- O WhatsApp pode desconectar após alguns dias
- Monitore o status e reconecte quando necessário
- Configure um alerta no n8n para verificar o status diariamente

### "Número não recebe"
- Verifique se o número está no formato correto: `5511999999999`
- Não use +, espaços, traços ou parênteses
- O número deve ter WhatsApp ativo

### "Render.com apaga após inatividade"
- O plano gratuito do Render.com "dorme" após 15 min sem uso
- Para evitar: use https://uptimerobot.com para fazer ping a cada 10 min (gratuito)

---

## DICA IMPORTANTE — SEGURANÇA

**NUNCA compartilhe:**
- Sua `AUTHENTICATION_API_KEY`
- O token da instância
- A URL da sua Evolution API em fóruns públicos

**Guarde em local seguro** (arquivo `minhas-chaves.txt` no seu computador, não na nuvem).

---

## PRÓXIMO PASSO

👉 Vá para o arquivo `06-CHECKLIST-FINAL.md` para a lista de verificação final.
