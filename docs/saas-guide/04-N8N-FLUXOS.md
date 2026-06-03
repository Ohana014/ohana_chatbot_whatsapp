# OHANA BOT — Módulo 4: n8n (Automações)

---

## O QUE É O n8n?

O n8n é como um "robô" que faz coisas automaticamente. Você cria um "fluxo" (flow) dizendo:
- **Quando** acontecer X (gatilho)
- **Faça** Y (ação)

Exemplo: *Quando chegar às 9h, verifique os vencimentos de hoje e envie WhatsApp para os clientes.*

---

## PASSO 1 — Criar conta no n8n

**Opção A (mais fácil) — n8n Cloud:**
1. Acesse: **https://n8n.io**
2. Clique em **"Get started for free"**
3. Crie sua conta
4. Você terá um endereço como: `https://seu-nome.n8n.cloud`

**Opção B — Instalar no Render.com (grátis, mais técnico):**
1. Acesse: **https://render.com**
2. Crie conta com GitHub
3. Clique em **"New → Web Service"**
4. Selecione **"Deploy an existing image from a registry"**
5. Image: `n8nio/n8n`
6. Nome: `ohana-n8n`
7. Clique "Create Web Service"

---

## PASSO 2 — Configurar credenciais do Supabase no n8n

1. No n8n, clique em **"Credentials"** (menu esquerdo)
2. Clique em **"Add Credential"**
3. Busque por **"Supabase"**
4. Preencha:
   - **Host**: sua SUPABASE_URL (sem o `https://`)
   - **Service Role Key**: pegue em Supabase → Settings → API → `service_role` (NÃO a anon key)
5. Clique **"Save"**

---

## FLUXO 1 — ALERTA DE VENCIMENTOS DIÁRIO

**O que faz:** Toda manhã às 9h, busca vencimentos próximos e envia WhatsApp.

### Como criar no n8n:

1. Clique em **"+ New Workflow"**
2. Nome: `Alerta Diário de Vencimentos`

**Adicionar nós (nodes) na ordem:**

### Nó 1: Schedule Trigger (Agendador)
- Clique no **"+"** para adicionar nó
- Busque **"Schedule Trigger"**
- Configure:
  - **Rule**: `Every Day`
  - **Hour**: `9`
  - **Minute**: `0`

### Nó 2: Supabase — Buscar Vencimentos
- Clique no **"+"** após o Schedule Trigger
- Busque **"Supabase"**
- Operação: **"Execute Query"**
- Query SQL:
```sql
SELECT
  v.id,
  v.titulo,
  v.tipo,
  v.data_vencimento,
  v.valor,
  c.nome AS cliente_nome,
  c.whatsapp AS cliente_whatsapp,
  c.telefone AS cliente_telefone,
  (v.data_vencimento - CURRENT_DATE) AS dias_para_vencer
FROM vencimentos v
JOIN clientes c ON c.id = v.cliente_id
WHERE
  v.status = 'aberto'
  AND v.data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
  AND c.whatsapp IS NOT NULL
ORDER BY v.data_vencimento ASC
```

### Nó 3: IF — Tem vencimentos?
- Busque **"IF"**
- Condição: `{{ $json.length }}` **Greater than** `0`

### Nó 4: Split in Batches — Processar um por um
- Busque **"Split In Batches"**
- **Batch Size**: `1`

### Nó 5: Set — Montar a mensagem
- Busque **"Set"**
- Adicionar campo **"mensagem"** com valor:
```
Olá *{{ $json.cliente_nome }}*! 👋

Passando para lembrar que você tem um vencimento próximo:

📋 *{{ $json.titulo }}*
💰 Valor: R$ {{ $json.valor }}
📅 Vence em: {{ $json.data_vencimento }}
⏰ Faltam {{ $json.dias_para_vencer }} dia(s)

Qualquer dúvida, estamos à disposição!

_Ohana Contabilidade_ 🏢
```

### Nó 6: HTTP Request — Enviar via Evolution API
- Busque **"HTTP Request"**
- **Method**: `POST`
- **URL**: `{{ $env.EVOLUTION_API_URL }}/message/sendText/ohana-bot`
- **Authentication**: `Generic Credential Type` → Header Auth
  - Name: `apikey`
  - Value: `{{ $env.EVOLUTION_API_KEY }}`
- **Body (JSON)**:
```json
{
  "number": "{{ $json.cliente_whatsapp }}",
  "text": "{{ $json.mensagem }}"
}
```

### Nó 7: Supabase — Atualizar histórico
- Busque **"Supabase"**
- Operação: **"Insert"**
- Tabela: `historico_whatsapp`
- Campos:
  - `cliente_id`: `{{ $json.cliente_id }}`
  - `vencimento_id`: `{{ $json.id }}`
  - `telefone_destino`: `{{ $json.cliente_whatsapp }}`
  - `tipo_mensagem`: `alerta`
  - `mensagem_enviada`: `{{ $json.mensagem }}`
  - `status_envio`: `enviado`

### Nó 8: Supabase — Atualizar contador de alertas
- Operação: **"Update"**
- Tabela: `vencimentos`
- ID: `{{ $json.id }}`
- Campos:
  - `alertas_enviados`: `{{ $json.alertas_enviados + 1 }}`
  - `ultimo_alerta_em`: `{{ new Date().toISOString() }}`

**Salve** o fluxo e clique em **"Activate"** (botão no canto superior direito).

---

## FLUXO 2 — ENVIAR DOCUMENTO VIA WEBHOOK

**O que faz:** Quando o Lovable salva um documento e marca "Enviar por WhatsApp", chama este fluxo.

### Como criar:

1. Clique em **"+ New Workflow"**
2. Nome: `Enviar Documento WhatsApp`

### Nó 1: Webhook (Gatilho)
- Busque **"Webhook"**
- **HTTP Method**: `POST`
- **Path**: `enviar-documento`
- Copie a URL gerada (você vai precisar dela para colocar no Lovable)
- A URL será algo como: `https://seu-n8n.cloud/webhook/enviar-documento`

**Corpo esperado (o Lovable vai enviar este JSON):**
```json
{
  "cliente_nome": "João Silva",
  "cliente_whatsapp": "5511999999999",
  "documento_descricao": "DARF - IRPJ Trimestral",
  "documento_tipo": "DARF",
  "competencia": "01/2025",
  "vencimento": "31/01/2025",
  "valor": "1250.00",
  "pdf_url": "https://xxx.supabase.co/storage/v1/object/public/documentos/arquivo.pdf",
  "documento_id": "uuid-aqui",
  "cliente_id": "uuid-aqui"
}
```

### Nó 2: Set — Montar mensagem de texto
- Adicionar campo **"mensagem"**:
```
Olá *{{ $json.body.cliente_nome }}*! 👋

Segue o documento para sua empresa:

📋 *{{ $json.body.documento_descricao }}*
📅 Competência: {{ $json.body.competencia }}
💰 Valor: R$ {{ $json.body.valor }}
⏰ Vencimento: {{ $json.body.vencimento }}

O arquivo PDF está anexo a esta mensagem.

Qualquer dúvida, estamos à disposição! 😊

_Ohana Contabilidade_ 🏢
```

### Nó 3: HTTP Request — Enviar mensagem de texto
- **Method**: `POST`
- **URL**: `{{ $env.EVOLUTION_API_URL }}/message/sendText/ohana-bot`
- **Header**: `apikey: SUA_EVOLUTION_API_KEY`
- **Body**:
```json
{
  "number": "{{ $json.body.cliente_whatsapp }}",
  "text": "{{ $json.mensagem }}"
}
```

### Nó 4: HTTP Request — Enviar PDF
- **Method**: `POST`
- **URL**: `{{ $env.EVOLUTION_API_URL }}/message/sendMedia/ohana-bot`
- **Header**: `apikey: SUA_EVOLUTION_API_KEY`
- **Body**:
```json
{
  "number": "{{ $json.body.cliente_whatsapp }}",
  "mediatype": "document",
  "mimetype": "application/pdf",
  "media": "{{ $json.body.pdf_url }}",
  "fileName": "{{ $json.body.documento_descricao }}.pdf",
  "caption": "{{ $json.body.documento_descricao }} - {{ $json.body.competencia }}"
}
```

### Nó 5: Supabase — Registrar no histórico
- Tabela: `historico_whatsapp`
- Inserir registro com os dados do envio

### Nó 6: Supabase — Marcar documento como enviado
- Tabela: `documentos`
- Atualizar campos:
  - `enviado_whatsapp`: `true`
  - `data_envio_whatsapp`: `{{ new Date().toISOString() }}`
  - `status`: `enviado`

### Nó 7: Respond to Webhook
- Adicionar nó **"Respond to Webhook"**
- **Response Code**: `200`
- **Body**: `{ "sucesso": true, "mensagem": "Documento enviado com sucesso!" }`

---

## FLUXO 3 — MARCAR VENCIDOS AUTOMATICAMENTE

**O que faz:** Todo dia à meia-noite, marca como "vencido" os que passaram da data.

### Como criar:

1. **Schedule Trigger**: todo dia às 00:05
2. **Supabase — Execute Query**:
```sql
UPDATE vencimentos
SET status = 'vencido', updated_at = NOW()
WHERE
  status = 'aberto'
  AND data_vencimento < CURRENT_DATE
```
3. **Supabase — Execute Query** (buscar os recém-vencidos para notificar):
```sql
SELECT
  v.*,
  c.nome AS cliente_nome,
  c.whatsapp AS cliente_whatsapp
FROM vencimentos v
JOIN clientes c ON c.id = v.cliente_id
WHERE
  v.status = 'vencido'
  AND v.data_vencimento = CURRENT_DATE - INTERVAL '1 day'
  AND c.whatsapp IS NOT NULL
```
4. **Split in Batches** → **Set (mensagem)** → **HTTP Request (Evolution API)**

**Mensagem para vencidos:**
```
⚠️ Olá *{{ $json.cliente_nome }}*!

O seguinte documento *venceu ontem* e ainda consta como pendente:

📋 *{{ $json.titulo }}*
💰 Valor: R$ {{ $json.valor }}
📅 Venceu em: {{ $json.data_vencimento }}

Por favor, entre em contato conosco para regularizar.

_Ohana Contabilidade_ 🏢
```

---

## FLUXO 4 — COBRANÇA DE HONORÁRIOS MENSAIS

**O que faz:** No dia 5 de cada mês, envia lembrete de pagamento dos honorários.

### Como criar:

1. **Schedule Trigger**: dia 5 de cada mês às 9h
   - Rule: `Every Month`
   - Day of Month: `5`
   - Hour: `9`

2. **Supabase — Execute Query**:
```sql
SELECT
  c.id,
  c.nome,
  c.whatsapp,
  v.titulo,
  v.valor,
  v.data_vencimento
FROM vencimentos v
JOIN clientes c ON c.id = v.cliente_id
WHERE
  v.tipo = 'Honorários'
  AND v.status = 'aberto'
  AND EXTRACT(MONTH FROM v.data_vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM v.data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND c.whatsapp IS NOT NULL
```

3. **Split in Batches** → **Set (mensagem)** → **HTTP Request**

**Mensagem:**
```
Olá *{{ $json.nome }}*! 😊

Passando para informar que sua fatura de honorários contábeis referente a este mês está disponível:

💼 *{{ $json.titulo }}*
💰 Valor: R$ {{ $json.valor }}
📅 Vencimento: {{ $json.data_vencimento }}

Para mais informações, entre em contato conosco.

_Ohana Contabilidade_ 🏢
```

---

## VARIÁVEIS DE AMBIENTE DO n8n

No n8n, vá em **Settings → Environment Variables** e adicione:

| Chave | Valor |
|---|---|
| `EVOLUTION_API_URL` | URL da sua Evolution API |
| `EVOLUTION_API_KEY` | Sua chave da Evolution API |
| `SUPABASE_URL` | URL do Supabase |
| `SUPABASE_SERVICE_KEY` | Service Role Key do Supabase |

---

## COMO CONECTAR O LOVABLE AO n8n

No código do Lovable, quando salvar um documento com WhatsApp marcado, adicione:

```typescript
// No arquivo de serviços do Lovable, ao salvar documento
const response = await fetch('https://SEU-N8N/webhook/enviar-documento', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cliente_nome: cliente.nome,
    cliente_whatsapp: cliente.whatsapp,
    documento_descricao: documento.descricao,
    documento_tipo: documento.tipo,
    competencia: documento.competencia,
    vencimento: documento.data_vencimento,
    valor: documento.valor,
    pdf_url: documento.arquivo_url,
    documento_id: documento.id,
    cliente_id: cliente.id
  })
});
```

**Dica:** No Lovable, use o prompt:
```
Quando salvar um documento com a opção "Enviar por WhatsApp" marcada,
faça uma chamada POST para: https://SEU-N8N/webhook/enviar-documento
com os dados do documento e cliente no corpo da requisição.
```

---

## PRÓXIMO PASSO

👉 Vá para o arquivo `05-EVOLUTION-API-WHATSAPP.md` para conectar o WhatsApp.
