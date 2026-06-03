# OHANA BOT — Módulo 3: Lovable (Tela do Sistema)

---

## O QUE É O LOVABLE?

O Lovable é uma ferramenta onde você **descreve em texto** o que quer, e ele **cria o código automaticamente**.
É como pedir para um programador: você fala, ele faz.

---

## PASSO 1 — Criar conta no Lovable

1. Acesse: **https://lovable.dev**
2. Clique em **"Get started free"**
3. Faça login com Google ou crie uma conta
4. Clique em **"New Project"**
5. Dê o nome: `ohana-bot`

---

## PASSO 2 — Conectar com Supabase

Antes de usar os prompts, você precisa conectar o Lovable ao Supabase:

1. No Lovable, clique no ícone de **"Integrations"** (lado esquerdo)
2. Clique em **"Supabase"**
3. Clique em **"Connect Supabase"**
4. Cole sua **SUPABASE_URL** e **SUPABASE_ANON_KEY** (do passo anterior)
5. Clique em **"Save"**

---

## PROMPTS DO LOVABLE

### IMPORTANTE: Como usar os prompts
- Abra o Lovable
- No campo de texto (caixa de chat), **cole o prompt completo**
- Clique em **"Send"** ou pressione Enter
- Aguarde o Lovable gerar o código (leva ~30 segundos)
- Se algo não ficou certo, peça ajuste no chat

---

## PROMPT 1 — ESTRUTURA BASE DO SISTEMA

Cole este prompt primeiro (é o mais importante):

```
Crie um sistema SaaS de gestão contábil chamado "OHANA BOT" com as seguintes características:

DESIGN:
- Tema escuro profissional com cores: azul escuro (#1e293b) como fundo principal, azul médio (#334155) para cards, azul (#3b82f6) como cor de destaque, e branco para textos
- Logo: texto "OHANA BOT" com ícone de balança da justiça ao lado, fonte bold
- Layout responsivo (funciona no celular e computador)
- Sidebar (menu lateral) com ícones

PÁGINAS/ROTAS:
- /login - Tela de login
- /dashboard - Painel principal
- /clientes - Lista de clientes
- /clientes/novo - Cadastrar cliente
- /clientes/:id - Ver/editar cliente
- /documentos - Lista de documentos
- /documentos/upload - Upload de PDF
- /vencimentos - Calendário de vencimentos
- /configuracoes - Configurações do sistema

MENU LATERAL (sidebar):
- Dashboard (ícone: LayoutDashboard)
- Clientes (ícone: Users)
- Documentos (ícone: FileText)
- Vencimentos (ícone: Calendar)
- Configurações (ícone: Settings)
- Botão de sair (ícone: LogOut)

Use React + TypeScript + Tailwind CSS + shadcn/ui components.
Use o cliente Supabase já configurado para todas as operações de banco de dados.
```

---

## PROMPT 2 — TELA DE LOGIN

```
Crie a tela de Login (/login) do OHANA BOT com:

VISUAL:
- Fundo escuro (#0f172a) com um card centralizado branco/escuro
- Logo "OHANA BOT" no topo do card
- Subtítulo: "Gestão Contábil Inteligente"

CAMPOS:
- Email (placeholder: "seu@email.com")
- Senha (placeholder: "••••••••") com botão de mostrar/esconder senha
- Botão "Entrar" (cor azul, largura total)
- Link "Esqueci minha senha"

FUNCIONALIDADE:
- Usar Supabase Auth (supabase.auth.signInWithPassword)
- Ao fazer login com sucesso, redirecionar para /dashboard
- Mostrar mensagem de erro se credenciais erradas
- Loading spinner no botão enquanto está fazendo login
- Manter sessão (não pedir login toda vez)

PROTEÇÃO DE ROTAS:
- Se não estiver logado e tentar acessar qualquer página, redirecionar para /login
- Se estiver logado e acessar /login, redirecionar para /dashboard
```

---

## PROMPT 3 — DASHBOARD (PAINEL PRINCIPAL)

```
Crie o Dashboard (/dashboard) do OHANA BOT com:

CARDS DE RESUMO (linha superior com 4 cards):
1. "Total de Clientes" - número total + ícone Users - cor azul
2. "Documentos Enviados" - total enviados esse mês + ícone FileText - cor verde
3. "Vencimentos Hoje" - quantidade de vencimentos do dia + ícone AlertCircle - cor amarelo
4. "Vencimentos em Atraso" - quantidade vencidos não pagos + ícone XCircle - cor vermelho

TABELA "PRÓXIMOS VENCIMENTOS":
- Colunas: Cliente | Descrição | Tipo | Vencimento | Valor | Status | Ações
- Status com badges coloridos: aberto=azul, vencido=vermelho, pago=verde
- Botão "Enviar WhatsApp" em cada linha
- Mostrar apenas os próximos 10 vencimentos ordenados por data
- Buscar dados da tabela "vencimentos" com join em "clientes"

TABELA "ÚLTIMOS DOCUMENTOS":
- Colunas: Cliente | Descrição | Tipo | Enviado em | Status WhatsApp
- Mostrar os últimos 5 documentos cadastrados
- Buscar da tabela "documentos" com join em "clientes"

Todos os dados devem vir do Supabase em tempo real (usar useEffect + supabase.from().select()).
```

---

## PROMPT 4 — CADASTRO DE CLIENTES

```
Crie as páginas de Clientes do OHANA BOT:

PÁGINA LISTA (/clientes):
- Tabela com colunas: Nome | CPF/CNPJ | Telefone | WhatsApp | Tipo (PF/PJ) | Status | Ações
- Barra de busca por nome ou CPF/CNPJ (filtro em tempo real)
- Botão "Novo Cliente" (canto superior direito, cor azul)
- Filtro por tipo: Todos | Pessoa Física | Pessoa Jurídica
- Ações na tabela: botão Editar (ícone lápis) e botão Desativar (ícone X)
- Paginação (10 clientes por página)
- Buscar dados da tabela "clientes" do Supabase

PÁGINA NOVO CLIENTE (/clientes/novo):
- Formulário com as seguintes seções:

SEÇÃO "Dados Pessoais":
- Tipo de pessoa: radio buttons "Pessoa Física" ou "Pessoa Jurídica"
- Nome completo / Razão Social (obrigatório)
- CPF (se PF) ou CNPJ (se PJ) com máscara automática (obrigatório)
- Email
- Telefone com máscara (obrigatório)
- WhatsApp com máscara (se diferente do telefone)

SEÇÃO "Endereço" (expansível):
- CEP com busca automática (ViaCEP API)
- Logradouro, Número, Complemento
- Bairro, Cidade, Estado

SEÇÃO "Dados da Empresa" (aparecer apenas se PJ):
- Nome Fantasia
- Inscrição Estadual
- Inscrição Municipal
- Regime Tributário: select com opções (Simples Nacional, Lucro Presumido, Lucro Real, MEI)
- CNAE
- Data de Abertura
- Sócios (campo de texto livre)

SEÇÃO "Observações":
- Campo de texto livre

Botões: "Cancelar" (volta para lista) e "Salvar Cliente" (cor azul)

VALIDAÇÕES:
- CPF/CNPJ válido (mostrar erro em vermelho se inválido)
- Telefone obrigatório
- Nome obrigatório
- Ao salvar PJ, criar automaticamente um registro na tabela "empresas" vinculado ao cliente

Ao salvar com sucesso, mostrar toast "Cliente cadastrado com sucesso!" e voltar para a lista.
```

---

## PROMPT 5 — UPLOAD E GESTÃO DE DOCUMENTOS

```
Crie as páginas de Documentos do OHANA BOT:

PÁGINA LISTA (/documentos):
- Tabela com colunas: Cliente | Empresa | Tipo | Descrição | Competência | Vencimento | Valor | Status | WhatsApp | Ações
- Filtros: por tipo de documento, por status, por cliente, por período de vencimento
- Barra de busca por descrição ou nome do cliente
- Botão "Novo Documento" (canto superior direito)
- Ações: Visualizar PDF | Enviar WhatsApp | Editar | Excluir
- Badge de status colorido: pendente=cinza, enviado=azul, pago=verde, vencido=vermelho
- Ícone de WhatsApp verde se já foi enviado, cinza se não foi
- Paginação (15 por página)

PÁGINA NOVO DOCUMENTO (/documentos/upload):
- Título: "Novo Documento"

SEÇÃO "Cliente":
- Select de busca: digitar nome ou CPF/CNPJ para filtrar clientes
- Ao selecionar cliente PJ, aparecer campo para selecionar a empresa

SEÇÃO "Dados do Documento":
- Tipo: select com opções (DARF, DAS, GPS, FGTS, IRPF, IRPJ, CSLL, PIS, COFINS, ISS, ICMS, Holerite, Contrato, Certidão, Outro)
- Descrição (ex: "DARF - IRPJ Trimestral")
- Competência: seletor de mês/ano (formato: 01/2025)
- Data de Vencimento: date picker
- Valor: campo monetário (R$) com formatação automática

SEÇÃO "Arquivo PDF":
- Área de arrastar e soltar arquivo (drag & drop)
- Também aceitar clique para selecionar arquivo
- Aceitar apenas PDF (validar extensão)
- Mostrar preview do nome do arquivo após seleção
- Barra de progresso durante upload
- Fazer upload para Supabase Storage no bucket "documentos"
- Salvar a URL do arquivo na tabela "documentos"

SEÇÃO "Envio WhatsApp":
- Checkbox: "Enviar por WhatsApp após salvar"
- Mostrar o número de WhatsApp do cliente (pré-preenchido)
- Preview da mensagem que será enviada (editável)

Botões: "Cancelar" e "Salvar Documento"

Ao salvar:
1. Fazer upload do PDF para Supabase Storage
2. Salvar registro na tabela "documentos"
3. Se checkbox de WhatsApp marcado, chamar webhook do n8n
4. Criar automaticamente um registro na tabela "vencimentos" se tiver data de vencimento
5. Mostrar toast de sucesso
```

---

## PROMPT 6 — CONTROLE DE VENCIMENTOS

```
Crie a página de Vencimentos (/vencimentos) do OHANA BOT:

MODO CALENDÁRIO:
- Calendário mensal visual com os vencimentos marcados nos dias
- Cada dia com vencimento mostra um ponto colorido (vermelho=vencido, amarelo=hoje, azul=futuro)
- Clicar no dia mostra os vencimentos daquele dia em um painel lateral
- Navegação entre meses (seta esquerda/direita)

MODO LISTA (botão para alternar):
- Tabela com colunas: Cliente | Empresa | Título | Tipo | Vencimento | Valor | Status | Alertas | Ações
- Filtros: status (aberto/pago/vencido/cancelado), período, tipo
- Ordenação por data de vencimento (mais próximo primeiro)

AÇÕES POR VENCIMENTO:
- Marcar como Pago (muda status para "pago", cor verde)
- Enviar alerta WhatsApp (abre modal com mensagem pré-preenchida)
- Editar vencimento
- Excluir

FORMULÁRIO NOVO VENCIMENTO (modal ao clicar "Novo Vencimento"):
- Selecionar cliente
- Título (ex: "DARF Setembro/2025")
- Tipo (DARF, DAS, GPS, Honorários, etc.)
- Data de vencimento (date picker)
- Valor (monetário)
- Alertar com quantos dias de antecedência (padrão: 3 dias)
- Vincular a um documento existente (select opcional)

INDICADORES VISUAIS:
- Card "Vence Hoje": X itens em vermelho piscante
- Card "Vence em 3 dias": X itens em amarelo
- Card "Em Atraso": X itens em vermelho
- Card "Pagos este mês": X itens em verde

Todos os dados vêm da tabela "vencimentos" com join em "clientes" do Supabase.
Atualização automática a cada 5 minutos (useEffect com setInterval).
```

---

## PROMPT 7 — PÁGINA DE CONFIGURAÇÕES

```
Crie a página de Configurações (/configuracoes) do OHANA BOT com abas:

ABA "WhatsApp":
- Campo: URL da Evolution API (input de texto)
- Campo: API Key da Evolution API (input com máscara de senha, botão de mostrar)
- Campo: Nome da Instância WhatsApp (padrão: "ohana-bot")
- Botão "Testar Conexão" (faz uma chamada GET para verificar se está funcionando)
- Status da conexão: verde "Conectado" ou vermelho "Desconectado"

ABA "Mensagens":
- Textarea: "Mensagem ao enviar documento"
  - Variáveis disponíveis: {nome}, {descricao}, {competencia}, {vencimento}, {valor}
  - Botão "Restaurar padrão"
- Textarea: "Mensagem de alerta de vencimento"
  - Mesmas variáveis + botão restaurar
- Preview da mensagem com um exemplo real

ABA "Alertas":
- Número: "Alertar quantos dias antes do vencimento" (padrão: 3)
- Toggle: "Enviar alerta automático de vencimentos" (liga/desliga)
- Horário do alerta automático (time picker, padrão: 09:00)
- Toggle: "Enviar confirmação de recebimento ao cliente"

ABA "Sistema":
- Campo: Nome do escritório
- Campo: Telefone do escritório
- Campo: Email do escritório
- Upload de logo do escritório
- Botão "Exportar dados (CSV)"

Todos os valores são salvos na tabela "configuracoes" do Supabase.
Botão "Salvar Configurações" em cada aba.
Toast de confirmação ao salvar.
```

---

## PROMPT 8 — HISTÓRICO DE WHATSAPP

```
Adicione na página de cada cliente (/clientes/:id) uma seção "Histórico de Mensagens WhatsApp":

- Timeline vertical com todas as mensagens enviadas para esse cliente
- Cada item da timeline mostra:
  * Ícone do tipo de mensagem (documento, cobrança, alerta)
  * Data e hora do envio
  * Número de destino
  * Preview da mensagem enviada (primeiros 100 caracteres)
  * Status: enviado/entregue/lido/erro com ícones (✓, ✓✓, 👁️, ✗)
  * Se for um documento, mostrar botão "Ver PDF"
- Filtrar por tipo de mensagem
- Paginação (mostrar 20 por página)
- Buscar da tabela "historico_whatsapp" filtrado por cliente_id

Também adicione nessa mesma página de cliente:
- Lista de documentos do cliente com opção de baixar PDF
- Lista de vencimentos do cliente com status
- Botão "Nova Mensagem WhatsApp" (abre modal para digitar e enviar mensagem manual)
```

---

## PROMPT FINAL — AJUSTES DE RESPONSIVIDADE

```
Revise todo o sistema OHANA BOT e faça os seguintes ajustes:

1. MOBILE: No celular, o menu lateral deve virar um menu hambúrguer (ícone ☰) no topo
2. MOBILE: As tabelas devem virar cards empilhados no celular
3. DARK MODE: Garantir que todos os textos estão legíveis no tema escuro
4. LOADING STATES: Adicionar skeleton loading em todas as tabelas enquanto carrega dados
5. EMPTY STATES: Quando não há dados, mostrar ilustração e mensagem amigável (ex: "Nenhum cliente cadastrado ainda. Clique em + para adicionar!")
6. TOAST NOTIFICATIONS: Confirmar que todos os erros e sucessos mostram notificações
7. CONFIRMAÇÃO DE EXCLUSÃO: Ao excluir qualquer item, mostrar modal de confirmação "Tem certeza?"
```

---

## DICAS IMPORTANTES NO LOVABLE

- Se algo não ficar como esperado, **peça ajuste em português** no chat do Lovable
- Você pode pedir: *"Mude a cor do botão para verde"*, *"Aumente a fonte da tabela"*, etc.
- **Não apague o histórico** de conversa no Lovable — ele usa o contexto anterior
- A cada prompt, o Lovable atualiza o sistema automaticamente
- Você pode ver a prévia do sistema em tempo real na janela direita do Lovable

---

## PRÓXIMO PASSO

👉 Vá para o arquivo `04-N8N-FLUXOS.md` para configurar as automações.
