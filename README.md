# Ohana Chatbot WhatsApp (Contábil + IA)

Chatbot de atendimento contábil automatizado via **WhatsApp Business (Meta Cloud API)** com integração à **OpenAI (ChatGPT)**, roteiros para **NFSe/NFe**, **RH/Folha**, **Impostos** e **Dúvidas**. 
Fluxo baseado no organograma enviado.

## ✅ Requisitos
- Conta no **Meta for Developers** com *WhatsApp Cloud API* habilitado
- Número verificado e **PHONE_NUMBER_ID**
- **ACCESS TOKEN** (System User) com permissão WhatsApp
- Chave **OpenAI API**
- SMTP para envio de e-mails (RH/Contabilidade)
- Node.js 18+

## 🔧 Configuração
1. Clone/extraia o projeto
2. Instale dependências: `npm install`
3. Crie `.env` com base no `.env.example`
4. Rode local: `npm start`
5. Exponha com ngrok: `npx ngrok http 3000`
6. Configure o Webhook no Meta:
   - URL: `https://SEU-NGROK/webhook`
   - VERIFY_TOKEN: o mesmo do `.env`
   - Assine `messages`

## 🧭 Fluxo (resumo)
1. Início → pergunta se é cliente (1=Sim / 2=Não)
   - Se não: direciona para Comercial/Planos (env `.COMERCIAL_URL`)
2. Serviço: (1) NF, (2) RH, (3) Impostos, (4) Dúvidas
3. NF: coleta dados e **(ponto flexível)** integra com seu emissor (placeholder)
4. RH: coleta dados e envia por e-mail ao RH
5. Impostos: registra e encaminha para cálculo (integre ao seu ERP/robô)
6. Dúvidas: responde com IA e copia para contabilidade por e-mail
7. Encerra com **protocolo**

## 🧩 Integração com Emissor de Nota (ponto flexível)
No arquivo `flows/flow.js`, etapa `nf_confirm`, substitua o trecho de simulação pela chamada real à sua API de NFSe/NFe. Exemplos comuns: Tiny, Bling, NFS-e municipal, provedores REST/SOAP.

## 🚀 Deploy
- **Railway/Render**: suba o repositório, configure as variáveis de ambiente do `.env`
- **Vercel**: usar adapter/Express (serverless) ou hospedar como Docker
- Domínio próprio opcional

## 🛡️ Observações
- Sessões mantidas **em memória** (trocar por Redis em produção)
- Valide CNPJ/CPF, formatos de valor e município conforme seu caso
- Trate LGPD (minimizar dados, avisar finalidade, retenção e sigilo)

## 📄 Licença
MIT


---
## 🧩 Emissão NFSe multi-CNPJ (providers plugáveis)
- Configure `config/issuers.json` com cada **CNPJ prestador** que você deseja emitir.
- Para cada empresa, escolha `provider`: `mock` (teste), `bling`, `tiny` ou `generic`.
- Preencha `credentials` conforme o provedor escolhido.
- O fluxo de NF coleta os dados e chama automaticamente o adapter correto via `services/issuerRouter.js`.

### Exemplo de `config/issuers.json`:
```json
{
  "companies": [
    {
      "cnpj": "00000000000191",
      "alias": "Ohana Matriz",
      "provider": "mock",
      "credentials": {
        "api_key": "MOCK_API_KEY",
        "company_id": "OHANA-MZ",
        "municipality_code": "3550308"
      }
    },
    {
      "cnpj": "11111111000100",
      "alias": "Ohana Filial",
      "provider": "generic",
      "credentials": {
        "base_url": "https://seu-emissor.com/api",
        "api_key": "SEU_TOKEN",
        "headers": { "X-Tenant": "OHANA-FL" },
        "paths": { "issue": "/nfse/emitir" },
        "municipality_code": "3534401"
      }
    }
  ]
}
```

### Onde plugar seu emissor
- **Mock**: `providers/mockNFSe.js` (retorna sucesso para testes).
- **Bling**: `providers/blingNFSe.js` (preencher endpoint/headers do Bling).
- **Tiny**: `providers/tinyNFSe.js` (preencher endpoint/headers do Tiny).
- **Genérico**: `providers/genericNFSe.js` (informe `base_url`, `headers` e `paths.issue` no `issuers.json`).

### Como funciona a seleção do CNPJ
- Na etapa de NF, o usuário informa o *CNPJ do prestador*.
- O roteador (`services/issuerRouter.js`) procura esse CNPJ em `config/issuers.json` e chama o adapter correspondente.
- Retornos esperados do adapter: `{ ok: boolean, number?: string, pdf_url?: string, message?: string }`.


---
## 🏙️ Prefeitura de São Paulo (NFS-e Paulistana) – SOAP com certificado A1
- Provider: `paulistana` (arquivo `providers/paulistanaNFSe.js`)
- Endpoint: `https://nfe.prefeitura.sp.gov.br/ws/lotenfe.asmx` (WSDL em `...?WSDL`)
- Autenticação: **TLS mútua** com **certificado A1** (PFX) — sem usuário/senha no header.
- XML: padrão **ABRASF** (Document/Literal, wrapped). Assinatura digital do XML (cada RPS ou lote) conforme manual.
- Variáveis `.env`:
  - `PAUL_CERT_PFX` e `PAUL_CERT_PASS` (ou `PAUL_CERT_PEM` + `PAUL_KEY_PEM`)
- Configure `config/issuers.json` para o(s) CNPJ(s) com `provider: "paulistana"` e inclua `im` (Inscrição Municipal) e parâmetros como `item_lista_servico`, `cnae`, `codigo_tributacao`, `municipality_code: "3550308"`.

### Exemplo:
```json
{
  "cnpj": "00000000000191",
  "alias": "Ohana Matriz SP",
  "provider": "paulistana",
  "credentials": {
    "im": "12345678",
    "municipality_code": "3550308",
    "item_lista_servico": "0107",
    "cnae": "8211300",
    "codigo_tributacao": "1234"
  }
}
```

> Observação: o adapter `paulistana` envia o **Lote RPS** e retorna confirmação genérica.
> Para produção, implemente:
> - **Assinatura digital XML** (tag por tag) conforme o manual.
> - **Consulta Situação do Lote** e **Consulta Lote** para capturar **número da NFS-e** e gerar **link/pdf**.
> - **Cancelamento** quando necessário.
