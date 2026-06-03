# OHANA BOT — Módulo 6: Checklist Final e Ordem de Execução

---

## ORDEM CORRETA PARA CONSTRUIR O SISTEMA

Siga essa ordem para evitar problemas. Cada etapa depende da anterior.

---

## SEMANA 1 — FUNDAÇÃO (Base do sistema)

### DIA 1 — Supabase (2 horas)

- [ ] Criar conta em supabase.com
- [ ] Criar projeto "ohana-bot" (região São Paulo)
- [ ] Salvar a senha do banco de dados
- [ ] Anotar SUPABASE_URL e SUPABASE_ANON_KEY
- [ ] Abrir SQL Editor
- [ ] Executar SQL 1 (uuid-ossp)
- [ ] Executar SQL 2 (tabela clientes)
- [ ] Executar SQL 3 (tabela empresas)
- [ ] Executar SQL 4 (tabela documentos)
- [ ] Executar SQL 5 (tabela vencimentos)
- [ ] Executar SQL 6 (tabela historico_whatsapp)
- [ ] Executar SQL 7 (tabela usuarios)
- [ ] Executar SQL 8 (tabela configuracoes + dados padrão)
- [ ] Executar SQL 9 (Storage para PDFs)
- [ ] Executar SQL 10 (índices)
- [ ] Verificar que todas as 7 tabelas aparecem no Table Editor
- [ ] Verificar que o bucket "documentos" aparece em Storage

### DIA 2 — Lovable (3 horas)

- [ ] Criar conta em lovable.dev
- [ ] Criar projeto "ohana-bot"
- [ ] Conectar Supabase no Lovable (Integrations → Supabase)
- [ ] Executar Prompt 1 (estrutura base)
- [ ] Verificar preview da tela no Lovable
- [ ] Executar Prompt 2 (tela de login)
- [ ] Testar login com usuário de teste
- [ ] Executar Prompt 3 (dashboard)
- [ ] Verificar que dashboard carrega dados do Supabase
- [ ] Executar Prompt 4 (cadastro de clientes)
- [ ] Testar cadastrar um cliente de teste
- [ ] Verificar que cliente aparece no Supabase

---

## SEMANA 2 — DOCUMENTOS E AUTOMAÇÕES

### DIA 3 — Continuar Lovable (2 horas)

- [ ] Executar Prompt 5 (upload de documentos)
- [ ] Testar upload de um PDF de teste
- [ ] Verificar que PDF foi para o Supabase Storage
- [ ] Executar Prompt 6 (controle de vencimentos)
- [ ] Testar criação de vencimento
- [ ] Executar Prompt 7 (configurações)
- [ ] Executar Prompt 8 (histórico WhatsApp)
- [ ] Executar Prompt Final (responsividade)
- [ ] Testar no celular (pelo Chrome → DevTools → mobile)

### DIA 4 — Evolution API (1.5 horas)

- [ ] Criar conta no Render.com (com GitHub)
- [ ] Deploy da Evolution API no Render
- [ ] Aguardar deploy completar (~5 min)
- [ ] Anotar URL da Evolution API
- [ ] Criar instância "ohana-bot"
- [ ] Escanear QR Code com seu WhatsApp
- [ ] Verificar status "open" (conectado)
- [ ] Testar envio de mensagem para seu próprio número
- [ ] Testar envio de PDF para seu próprio número
- [ ] Configurar o UptimeRobot para manter o Render ativo

### DIA 5 — n8n (2 horas)

- [ ] Criar conta n8n Cloud (ou deploy no Render)
- [ ] Configurar credencial Supabase no n8n
- [ ] Adicionar variáveis de ambiente (Evolution API URL e Key)
- [ ] Criar Fluxo 1 (Alerta Diário de Vencimentos)
- [ ] Testar o fluxo manualmente (botão "Execute Workflow")
- [ ] Ativar o Fluxo 1
- [ ] Criar Fluxo 2 (Enviar Documento via Webhook)
- [ ] Copiar URL do Webhook do Fluxo 2
- [ ] Testar o webhook com um cliente de teste
- [ ] Criar Fluxo 3 (Marcar Vencidos)
- [ ] Ativar o Fluxo 3

---

## SEMANA 3 — INTEGRAÇÃO E TESTES

### DIA 6 — Conectar tudo (2 horas)

- [ ] No Lovable, adicionar a URL do webhook n8n na tela de configurações
- [ ] Usar Prompt do Módulo 3 para conectar Lovable → n8n
- [ ] Testar fluxo completo:
  1. Cadastrar cliente de teste
  2. Fazer upload de um PDF
  3. Marcar "Enviar por WhatsApp"
  4. Salvar
  5. Verificar que o WhatsApp recebeu a mensagem e o PDF
  6. Verificar que o histórico foi salvo no Supabase

### DIA 7 — Testes finais e ajustes (2 horas)

- [ ] Criar 3 clientes de teste reais (com WhatsApp)
- [ ] Enviar 5 documentos reais
- [ ] Verificar alerta automático de vencimento (mudar data para hoje)
- [ ] Testar no celular (interface responsiva)
- [ ] Ajustar mensagens de WhatsApp no Supabase (tabela configuracoes)
- [ ] Remover dados de teste
- [ ] Convidar primeiro funcionário/usuário real

---

## CONFIGURAÇÕES FINAIS IMPORTANTES

### Ativar Row Level Security (RLS) no Supabase

Para proteger os dados, execute no SQL Editor:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vencimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política: usuários autenticados podem ver e editar tudo
CREATE POLICY "Authenticated full access" ON clientes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access" ON empresas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access" ON documentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access" ON vencimentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access" ON historico_whatsapp
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access" ON usuarios
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

### Criar primeiro usuário administrador

No Supabase, vá em **Authentication → Users → Add User**:
- Email: seu-email@email.com
- Password: sua senha forte
- Clique "Create User"

---

## RESUMO DOS CUSTOS (VERSÃO GRATUITA)

| Serviço | Plano Gratuito | Limitações |
|---|---|---|
| **Supabase** | Free (sempre) | 500MB banco, 1GB storage, 2GB transfer |
| **Lovable** | Free (limitado) | 5 projetos, exportação de código |
| **n8n Cloud** | Free (limitado) | 5 fluxos ativos, 2.500 execuções/mês |
| **Render.com** | Free | Dorme após 15 min, 512MB RAM |
| **Total** | **R$ 0/mês** para começar | Suficiente para testar |

**Quando crescer, upgrade recomendado:**
- Supabase Pro: ~$25/mês (mais storage e performance)
- n8n Cloud Starter: ~$20/mês (execuções ilimitadas)
- Render Starter: ~$7/mês (sem "dormir")

---

## TROUBLESHOOTING RÁPIDO

| Problema | Causa provável | Solução |
|---|---|---|
| Login não funciona | RLS bloqueando | Execute os SQLs de política acima |
| PDF não sobe | Bucket não criado | Execute SQL 9 novamente |
| WhatsApp desconectado | Inatividade no Render | Reescanear QR Code |
| n8n não envia | URL do webhook errada | Verificar URL no Lovable |
| Mensagem não chega | Número errado | Verificar formato: 5511999999999 |
| Dashboard vazio | Tabelas vazias | Normal no início, cadastre clientes |

---

## SUPORTE E COMUNIDADE

- **n8n em Português**: https://community.n8n.io (tem aba de PT-BR)
- **Supabase Docs**: https://supabase.com/docs (em inglês, mas com exemplos claros)
- **Evolution API**: https://doc.evolution-api.com
- **Lovable**: https://docs.lovable.dev

---

## PARABÉNS! 🎉

Ao completar este checklist, você terá um sistema SaaS profissional com:
- ✅ Cadastro completo de clientes e empresas
- ✅ Upload e gestão de documentos PDF
- ✅ Controle de vencimentos com calendário visual
- ✅ Envio automático de documentos via WhatsApp
- ✅ Alertas automáticos de vencimento
- ✅ Histórico completo de comunicações
- ✅ Sistema de login seguro
- ✅ Interface profissional e responsiva
