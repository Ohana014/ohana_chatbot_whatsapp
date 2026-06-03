# OHANA BOT — GUIA COMPLETO PARA INICIANTES
## Módulo 1: Arquitetura do Sistema

---

## O QUE É CADA FERRAMENTA? (Explicação simples)

| Ferramenta | O que faz | Analogia do dia a dia |
|---|---|---|
| **Lovable** | Cria a tela visual do sistema (frontend) | É o "Word" do seu sistema — você escreve e ele monta |
| **Supabase** | Guarda todos os dados (banco de dados) | É a "planilha Excel" mas poderosa e na nuvem |
| **n8n** | Automatiza tarefas (enviar WhatsApp, cobrar, etc.) | É o "estagiário" que faz coisas automáticas |
| **Evolution API** | Conecta com o WhatsApp | É o "aparelho" que envia as mensagens |

---

## VISÃO GERAL DA ARQUITETURA

```
USUÁRIO (você - contador)
        │
        ▼
┌─────────────────────────────────┐
│          LOVABLE (Tela)          │
│  • Login                         │
│  • Cadastro de Clientes          │
│  • Upload de PDFs                │
│  • Dashboard                     │
│  • Controle de Vencimentos       │
└────────────┬────────────────────┘
             │ salva / busca dados
             ▼
┌─────────────────────────────────┐
│        SUPABASE (Banco)          │
│  • Tabela: clientes              │
│  • Tabela: empresas              │
│  • Tabela: documentos            │
│  • Tabela: vencimentos           │
│  • Storage: PDFs                 │
└────────────┬────────────────────┘
             │ gatilho / webhook
             ▼
┌─────────────────────────────────┐
│          n8n (Automação)         │
│  • Fluxo: cobrar vencimentos     │
│  • Fluxo: enviar documentos      │
│  • Fluxo: alertas de prazo       │
└────────────┬────────────────────┘
             │ envia mensagens
             ▼
┌─────────────────────────────────┐
│      Evolution API (WhatsApp)    │
│  • Conecta seu número            │
│  • Envia PDFs                    │
│  • Envia textos                  │
│  • Recebe respostas              │
└─────────────────────────────────┘
```

---

## AS 8 ETAPAS DO PROJETO

| Etapa | O que você vai fazer | Tempo estimado |
|---|---|---|
| **1** | Criar conta no Supabase + tabelas | 30 min |
| **2** | Criar conta no Lovable + tela de login | 20 min |
| **3** | Criar tela de clientes no Lovable | 30 min |
| **4** | Criar tela de documentos/PDF no Lovable | 30 min |
| **5** | Criar tela de vencimentos no Lovable | 20 min |
| **6** | Instalar n8n + configurar fluxos | 1 hora |
| **7** | Instalar Evolution API + conectar WhatsApp | 30 min |
| **8** | Testar tudo junto | 30 min |

**Total estimado: ~4 horas para ter o sistema funcionando!**

---

## CONTAS QUE VOCÊ PRECISA CRIAR (GRATUITAS)

1. **Supabase**: https://supabase.com → clique "Start for free"
2. **Lovable**: https://lovable.dev → clique "Get started free"
3. **n8n**: https://n8n.io → clique "Get started free" (ou instalar no servidor)
4. **Evolution API**: instalar no servidor (Railway ou Render — gratuito)

---

## SENHAS E CHAVES (ONDE GUARDAR)

Crie um arquivo no seu computador chamado `minhas-chaves.txt` e salve:

```
SUPABASE_URL = (você vai pegar no Supabase)
SUPABASE_ANON_KEY = (você vai pegar no Supabase)
N8N_URL = (endereço do seu n8n)
EVOLUTION_API_URL = (endereço da sua Evolution API)
EVOLUTION_API_KEY = (chave da Evolution API)
```

---

## PRÓXIMO PASSO

👉 Vá para o arquivo `02-SUPABASE-TABELAS.md` para criar o banco de dados.
