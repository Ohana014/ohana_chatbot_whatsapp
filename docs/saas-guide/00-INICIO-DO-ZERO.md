# OHANA BOT — DO ZERO ABSOLUTO
## Para quem nunca programou nada na vida

---

> **Leia isso primeiro:**
> Você não vai precisar escrever código.
> Você não vai precisar entender programação.
> Você só vai precisar: clicar, copiar, colar e seguir os passos.
> Se travar em algo, está descrito exatamente o que fazer.

---

# PARTE 1 — O QUE VOCÊ PRECISA TER ANTES DE COMEÇAR

## Ferramentas no seu computador

### 1. Navegador Google Chrome
- Se não tiver, baixe em: **https://www.google.com/chrome**
- Clique no botão azul "Baixar Chrome"
- Abra o arquivo baixado e instale normalmente
- *Use sempre o Chrome para este projeto — evita problemas de compatibilidade*

### 2. Um arquivo de bloco de notas para salvar suas senhas
- No Windows: aperte a tecla Windows → digite "Bloco de Notas" → abra
- Salve o arquivo como: `OHANA-BOT-SENHAS.txt` na sua Área de Trabalho
- Você vai colar senhas e endereços aqui ao longo do processo

---

# PARTE 2 — CRIAR AS 4 CONTAS (faça nessa ordem)

## CONTA 1 — GitHub (obrigatório para as outras)

O GitHub é como uma "pasta na nuvem" para guardar seu sistema. As outras ferramentas usam ele para fazer login.

**Passo a passo:**

1. Abra o Chrome e acesse: **https://github.com**
2. Clique no botão verde **"Sign up"** (canto superior direito)
3. Digite seu email → clique "Continue"
4. Crie uma senha forte → clique "Continue"
5. Escolha um nome de usuário (ex: `ohana-contabilidade`) → clique "Continue"
6. Resolva o captcha (aquele quebra-cabeça de imagens)
7. Clique "Create account"
8. Abra seu email → procure o email do GitHub → copie o código de 6 dígitos → cole no site
9. Quando perguntar o plano, escolha **"Free"** → clique "Continue for free"
10. Pronto! Você tem uma conta GitHub.

**Salve no bloco de notas:**
```
GITHUB
  Email: (seu email)
  Senha: (sua senha)
  Usuário: (nome que você escolheu)
```

---

## CONTA 2 — Supabase (banco de dados)

O Supabase guarda todos os dados: clientes, documentos, vencimentos.

**Passo a passo:**

1. Acesse: **https://supabase.com**
2. Clique no botão verde **"Start your project"**
3. Clique em **"Continue with GitHub"** (o botão com o ícone do gatinho)
4. Uma janela vai abrir perguntando se autoriza → clique **"Authorize supabase"**
5. Você vai entrar direto no painel do Supabase
6. Clique em **"New project"**
7. Preencha assim:
   - **Organization**: já deve ter uma com seu nome, deixe assim
   - **Name**: `ohana-bot`
   - **Database Password**: clique em "Generate a password" → copie a senha gerada
   - **Region**: clique no menu → selecione **"South America (São Paulo)"**
   - **Pricing Plan**: deixe em Free
8. Clique no botão verde **"Create new project"**
9. Vai aparecer uma tela de carregamento com uma barrinha verde → aguarde ~2 minutos

**Pegar as chaves (faça isso após o projeto criar):**

1. No menu esquerdo, clique no ícone de engrenagem ⚙️ (**"Project Settings"**)
2. Clique em **"API"** (no submenu que aparece)
3. Você vai ver uma tela com informações. Procure:
   - **"Project URL"** → copie o endereço que começa com `https://`
   - **"Project API keys"** → em "anon public" → clique em "copy" (o ícone de dois quadradinhos)

**Salve no bloco de notas:**
```
SUPABASE
  Email: (mesmo do GitHub)
  URL do projeto: https://xxxxxxxxxxx.supabase.co
  Chave anon: eyJxxxxxxxx... (é bem longa)
  Senha do banco: (a que foi gerada)
```

---

## CONTA 3 — Lovable (cria a tela do sistema)

O Lovable é onde você vai "desenhar" seu sistema escrevendo em português.

**Passo a passo:**

1. Acesse: **https://lovable.dev**
2. Clique em **"Get started"** ou **"Sign up"**
3. Clique em **"Continue with GitHub"**
4. Autorize → clique **"Authorize lovable-dev"**
5. Vai aparecer a tela principal do Lovable (painel branco com campo de texto)
6. Pronto! Conta criada.

**Salve no bloco de notas:**
```
LOVABLE
  Email: (mesmo do GitHub)
  Endereço do app: (vai aparecer depois)
```

---

## CONTA 4 — Render.com (hospedagem gratuita)

O Render.com é onde vamos instalar a Evolution API (que conecta com WhatsApp) e o n8n (automações).

**Passo a passo:**

1. Acesse: **https://render.com**
2. Clique em **"Get Started for Free"**
3. Clique em **"GitHub"** para entrar com sua conta GitHub
4. Clique em **"Authorize render"**
5. Preencha o formulário que aparecer (nome, o que vai usar, etc.) → clique "Continue"
6. Pronto! Você tem conta no Render.

**Salve no bloco de notas:**
```
RENDER.COM
  Email: (mesmo do GitHub)
```

---

# PARTE 3 — SUPABASE: CRIAR AS TABELAS

## O que são tabelas?

Pense numa planilha Excel. Cada tabela é uma aba da planilha. A tabela "clientes" tem as colunas: nome, cpf, telefone, etc. Você não precisa criar manualmente — vai copiar e colar um código que faz isso automaticamente.

## Como acessar o SQL Editor

1. Acesse: **https://supabase.com** → clique em **"Sign In"** → entre com GitHub
2. Clique no projeto **"ohana-bot"**
3. No menu esquerdo, procure o ícone que parece uma barrinha de código `</>` → é o **"SQL Editor"**
4. Clique em **"New query"** (canto superior direito, ou aparece automaticamente)
5. Vai abrir uma área de texto escura → é aqui que você vai colar os códigos

## Como executar um SQL

1. Clique dentro da área de texto escura
2. Apague tudo que tiver lá (Ctrl+A → Delete)
3. Cole o código SQL (Ctrl+V)
4. Clique no botão verde **"Run"** (canto inferior direito) ou aperte **Ctrl+Enter**
5. Embaixo vai aparecer **"Success. No rows returned"** → significa que funcionou!
6. Se aparecer vermelho com erro → me avise com o texto do erro

---

## SQL 1 — Execute este primeiro

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```
*(Cole, clique RUN, espere aparecer Success)*

---

## SQL 2 — Tabela de Clientes

```sql
CREATE TABLE clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18) NOT NULL UNIQUE,
  email VARCHAR(255),
  telefone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20),
  endereco TEXT,
  cidade VARCHAR(100),
  estado CHAR(2),
  cep VARCHAR(10),
  tipo VARCHAR(10) DEFAULT 'PF' CHECK (tipo IN ('PF', 'PJ')),
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## SQL 3 — Tabela de Empresas

```sql
CREATE TABLE empresas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  inscricao_estadual VARCHAR(30),
  inscricao_municipal VARCHAR(30),
  regime_tributario VARCHAR(30) DEFAULT 'Simples Nacional',
  cnae VARCHAR(10),
  data_abertura DATE,
  socios TEXT,
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## SQL 4 — Tabela de Documentos

```sql
CREATE TABLE documentos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  tipo VARCHAR(50) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  competencia VARCHAR(7),
  data_vencimento DATE,
  valor DECIMAL(15,2),
  status VARCHAR(20) DEFAULT 'pendente',
  arquivo_url TEXT,
  arquivo_nome VARCHAR(255),
  enviado_whatsapp BOOLEAN DEFAULT false,
  data_envio_whatsapp TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## SQL 5 — Tabela de Vencimentos

```sql
CREATE TABLE vencimentos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  documento_id UUID REFERENCES documentos(id) ON DELETE SET NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_vencimento DATE NOT NULL,
  valor DECIMAL(15,2),
  tipo VARCHAR(50),
  status VARCHAR(20) DEFAULT 'aberto',
  alertar_dias_antes INTEGER DEFAULT 3,
  alertas_enviados INTEGER DEFAULT 0,
  ultimo_alerta_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## SQL 6 — Tabela de Histórico WhatsApp

```sql
CREATE TABLE historico_whatsapp (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  documento_id UUID REFERENCES documentos(id) ON DELETE SET NULL,
  vencimento_id UUID REFERENCES vencimentos(id) ON DELETE SET NULL,
  telefone_destino VARCHAR(20) NOT NULL,
  tipo_mensagem VARCHAR(30),
  mensagem_enviada TEXT,
  status_envio VARCHAR(20) DEFAULT 'enviado',
  resposta_cliente TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## SQL 7 — Tabela de Usuários

```sql
CREATE TABLE usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_id UUID UNIQUE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  perfil VARCHAR(20) DEFAULT 'operador',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## SQL 8 — Tabela de Configurações

```sql
CREATE TABLE configuracoes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT,
  descricao TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('evolution_api_url', '', 'URL da Evolution API'),
  ('evolution_api_key', '', 'Chave da Evolution API'),
  ('evolution_instance', 'ohana-bot', 'Nome da instância WhatsApp'),
  ('dias_alerta_vencimento', '3', 'Dias antes para alertar'),
  ('nome_escritorio', 'Ohana Contabilidade', 'Nome do escritório'),
  ('mensagem_documento', 'Olá *{nome}*! Segue o documento: *{descricao}* - Vencimento: {vencimento}. Ohana Contabilidade.', 'Mensagem ao enviar documento'),
  ('mensagem_cobranca', 'Olá *{nome}*! Seu documento *{descricao}* vence em {vencimento}. Valor: R$ {valor}. Ohana Contabilidade.', 'Mensagem de cobrança');
```

---

## SQL 9 — Storage para PDFs

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "upload_autenticado" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "leitura_publica" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'documentos');
```

---

## SQL 10 — Segurança (RLS)

```sql
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vencimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acesso_total_autenticado" ON clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_autenticado" ON empresas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_autenticado" ON documentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_autenticado" ON vencimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_autenticado" ON historico_whatsapp FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_autenticado" ON usuarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_autenticado" ON configuracoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

## Como verificar se deu certo

1. No menu esquerdo do Supabase, clique em **"Table Editor"** (ícone de tabela)
2. Você deve ver na lista: clientes, configuracoes, documentos, empresas, historico_whatsapp, usuarios, vencimentos
3. Clique em **"Storage"** no menu esquerdo → deve aparecer o bucket "documentos"

---

## Criar o primeiro usuário (sua conta de admin)

1. No menu esquerdo, clique em **"Authentication"** (ícone de cadeado)
2. Clique em **"Users"**
3. Clique no botão **"Add user"** → **"Create new user"**
4. Preencha:
   - Email: seu email real
   - Password: uma senha forte (ex: `OhanaBot@2025!`)
5. Clique **"Create user"**
6. Salve no bloco de notas:
```
SUPABASE - LOGIN DO SISTEMA
  Email: (seu email)
  Senha: (sua senha)
```

---

# PARTE 4 — LOVABLE: CRIAR A TELA

## O que é o Lovable?

Você escreve em português o que quer, ele cria o sistema. É como WhatsApp — você digita uma mensagem e ele responde com o código pronto.

## Abrir o Lovable e criar o projeto

1. Acesse: **https://lovable.dev**
2. Faça login com GitHub (se pedido)
3. Clique no botão **"+"** ou **"New Project"**
4. No campo que aparece, digite: `ohana-bot`
5. Aperte Enter
6. Vai abrir uma tela com:
   - Lado ESQUERDO: chat para você escrever
   - Lado DIREITO: preview do seu sistema

## Conectar o Supabase ao Lovable

**Faça isso ANTES de usar qualquer prompt:**

1. No Lovable, olhe para o lado esquerdo — tem um menu com ícones
2. Procure o ícone que parece um banco de dados ou "Integrations"
3. Clique em **"Supabase"**
4. Clique em **"Connect to Supabase"**
5. Uma janela vai abrir → clique **"Connect"**
6. Vai pedir para você autorizar → clique em **"Authorize"**
7. Selecione o projeto **"ohana-bot"** que você criou
8. Clique **"Connect project"**
9. Deve aparecer um ✅ verde "Connected"

**Alternativa (se não encontrar o botão):**
1. Clique no ícone de engrenagem ⚙️ no Lovable
2. Procure "Environment Variables" ou "Supabase"
3. Cole:
   - `VITE_SUPABASE_URL` = (sua URL do Supabase)
   - `VITE_SUPABASE_ANON_KEY` = (sua chave anon do Supabase)

---

## PROMPTS DO LOVABLE — Cole um de cada vez

### COMO USAR:
1. Clique na caixa de texto do lado esquerdo
2. Copie o texto do prompt abaixo (Ctrl+C)
3. Cole na caixa (Ctrl+V)
4. Aperte Enter ou clique no botão de enviar (seta →)
5. Aguarde o Lovable trabalhar (~30 a 60 segundos)
6. Veja o resultado no lado direito
7. Só passe para o próximo prompt depois que o atual terminar

---

### PROMPT 1 — Cole agora (estrutura base)

```
Crie um sistema SaaS de gestão contábil chamado OHANA BOT.

Configuração técnica:
- Use React + TypeScript + Tailwind CSS + shadcn/ui
- Conecte ao Supabase já configurado neste projeto
- Use react-router-dom para navegação entre páginas

Design:
- Tema escuro com fundo #0f172a, cards #1e293b, destaque azul #3b82f6
- Logo: texto "OHANA BOT" com ícone Scale (balança) em azul
- Menu lateral fixo com ícones e textos

Páginas que o sistema deve ter:
- /login — tela de login
- /dashboard — painel com resumos
- /clientes — lista de clientes
- /clientes/novo — formulário novo cliente
- /documentos — lista de documentos
- /documentos/novo — upload de documento
- /vencimentos — calendário de vencimentos
- /configuracoes — configurações

Menu lateral (sidebar) com:
- Logo no topo
- Link: Dashboard (ícone LayoutDashboard)
- Link: Clientes (ícone Users)
- Link: Documentos (ícone FileText)
- Link: Vencimentos (ícone Calendar)
- Link: Configurações (ícone Settings)
- Botão Sair no rodapé (ícone LogOut)

Proteja todas as rotas: se não estiver logado, redirecionar para /login.
Use supabase.auth para verificar se o usuário está logado.
```

*Aguarde terminar antes de continuar.*

---

### PROMPT 2 — Tela de Login

```
Crie a tela de login (/login) do OHANA BOT:

Visual:
- Fundo escuro (#0f172a)
- Card centralizado com bordas arredondadas e sombra
- Logo "OHANA BOT" com ícone de balança no topo do card
- Subtítulo: "Sistema de Gestão Contábil"

Formulário:
- Campo email com ícone de envelope, placeholder "seu@email.com"
- Campo senha com ícone de cadeado, botão de ver/esconder senha (olho)
- Botão "Entrar" azul (#3b82f6), largo, com loading spinner quando processando

Funcionalidade:
- Chamar supabase.auth.signInWithPassword({ email, password })
- Se login OK → ir para /dashboard
- Se erro → mostrar mensagem em vermelho: "Email ou senha incorretos"
- Manter o usuário logado (não pedir login toda vez que abrir o sistema)
```

*Aguarde terminar antes de continuar.*

---

### PROMPT 3 — Dashboard

```
Crie o Dashboard (/dashboard) do OHANA BOT:

4 cards no topo com contadores (buscar do Supabase):
1. "Clientes Ativos" — contar registros em clientes onde ativo=true — ícone Users — cor azul
2. "Documentos este mês" — contar documentos criados este mês — ícone FileText — cor verde
3. "Vencem Hoje" — contar vencimentos com data_vencimento = hoje e status = aberto — ícone AlertCircle — cor amarelo
4. "Em Atraso" — contar vencimentos com data_vencimento < hoje e status = aberto — ícone XCircle — cor vermelho

Tabela "Próximos Vencimentos":
- Buscar da tabela vencimentos com join em clientes
- Filtrar: status = aberto, data_vencimento entre hoje e hoje+7 dias
- Colunas: Cliente | Descrição | Tipo | Vencimento | Valor | Status
- Status como badge colorido: aberto=azul, vencido=vermelho, pago=verde
- Ordenar por data_vencimento crescente
- Mostrar no máximo 10 registros

Tabela "Últimos Documentos":
- Buscar da tabela documentos com join em clientes
- Ordenar por created_at decrescente
- Mostrar últimos 5
- Colunas: Cliente | Documento | Tipo | Data | WhatsApp enviado (ícone verde ou cinza)

Titulo da página: "Dashboard" com data atual no canto direito
```

*Aguarde terminar antes de continuar.*

---

### PROMPT 4 — Cadastro de Clientes

```
Crie as páginas de clientes do OHANA BOT:

PÁGINA /clientes (lista):
- Título "Clientes" + botão "Novo Cliente" no canto direito
- Barra de busca: filtrar por nome ou cpf_cnpj em tempo real
- Filtro por tipo: botões "Todos" | "Pessoa Física" | "Pessoa Jurídica"
- Tabela com: Nome | CPF/CNPJ | Telefone | WhatsApp | Tipo | Status (ativo/inativo) | Ações
- Ações: botão Editar (lápis) e botão Desativar (toggle)
- Paginação 10 por página
- Buscar da tabela clientes do Supabase, ordenar por nome

PÁGINA /clientes/novo (formulário):
Seção 1 - "Tipo de Pessoa":
- Dois botões grandes: "Pessoa Física (CPF)" e "Pessoa Jurídica (CNPJ)"
- O selecionado fica azul, o outro cinza

Seção 2 - "Dados Principais":
- Nome Completo (obrigatório)
- CPF ou CNPJ dependendo da escolha acima (obrigatório) — aplicar máscara automática
- Email
- Telefone com máscara (obrigatório)
- WhatsApp com máscara (campo separado)

Seção 3 - "Endereço" (recolhível, clicar para expandir):
- CEP com botão de busca automática (usar a API: https://viacep.com.br/ws/{cep}/json/)
- Ao buscar CEP, preencher automaticamente: Logradouro, Bairro, Cidade, Estado
- Campos: Logradouro, Número, Complemento, Bairro, Cidade, Estado

Seção 4 - "Dados da Empresa" (aparecer somente se Pessoa Jurídica selecionada):
- Razão Social, Nome Fantasia
- Inscrição Estadual, Inscrição Municipal
- Regime Tributário: select com (Simples Nacional, Lucro Presumido, Lucro Real, MEI)
- CNAE, Data de Abertura

Seção 5 - "Observações":
- Textarea livre

Botões no rodapé: "Cancelar" (volta para lista) e "Salvar" (azul)

Ao salvar:
- Inserir na tabela clientes do Supabase
- Se for PJ, inserir também na tabela empresas vinculada ao cliente
- Mostrar toast verde "Cliente salvo com sucesso!"
- Redirecionar para a lista de clientes
```

*Aguarde terminar antes de continuar.*

---

### PROMPT 5 — Upload de Documentos

```
Crie as páginas de documentos do OHANA BOT:

PÁGINA /documentos (lista):
- Título "Documentos" + botão "Novo Documento"
- Filtros: select de Tipo, select de Status, campo de busca por descrição ou cliente
- Tabela: Cliente | Empresa | Tipo | Descrição | Competência | Vencimento | Valor | Status | WhatsApp | Ações
- Status badges: pendente=cinza, enviado=azul, pago=verde, vencido=vermelho
- Coluna WhatsApp: ícone verde ✓ se enviado_whatsapp=true, ícone cinza se false
- Ações: Ver PDF (abre em nova aba) | Enviar WhatsApp | Editar | Excluir
- Paginação 15 por página
- Buscar da tabela documentos com join em clientes

PÁGINA /documentos/novo (formulário upload):

Seção 1 - "Selecionar Cliente":
- Campo de busca com autocomplete: digitar nome ou CPF/CNPJ filtra clientes do Supabase
- Ao selecionar um cliente PJ, aparecer campo "Empresa" com as empresas do cliente

Seção 2 - "Dados do Documento":
- Tipo: select com opções (DARF, DAS, GPS, FGTS, IRPF, IRPJ, CSLL, PIS, COFINS, ISS, ICMS, Holerite, Contrato, Certidão, Outro)
- Descrição: texto (ex: "DARF IRPJ 1T/2025")
- Competência: dois selects lado a lado — Mês e Ano (ex: Janeiro 2025)
- Data de Vencimento: date picker
- Valor: campo com prefixo "R$" e máscara de moeda

Seção 3 - "Arquivo PDF":
- Área grande de drag & drop: "Arraste o PDF aqui ou clique para selecionar"
- Apenas aceitar arquivos .pdf (mostrar erro se outro tipo)
- Após selecionar: mostrar nome do arquivo e tamanho
- Barra de progresso durante upload
- Fazer upload para o bucket "documentos" do Supabase Storage
- Salvar a URL pública retornada no campo arquivo_url

Seção 4 - "Enviar via WhatsApp":
- Checkbox "Enviar por WhatsApp após salvar"
- Quando marcado, mostrar: número de WhatsApp do cliente (pré-preenchido), preview da mensagem

Botões: "Cancelar" e "Salvar Documento"

Ao salvar:
1. Upload do PDF para Supabase Storage
2. Inserir na tabela documentos
3. Se tiver data_vencimento, inserir também na tabela vencimentos
4. Se checkbox WhatsApp marcado, fazer fetch POST para URL do webhook n8n (deixar campo configurável em configuracoes)
5. Toast "Documento salvo com sucesso!"
```

*Aguarde terminar antes de continuar.*

---

### PROMPT 6 — Vencimentos

```
Crie a página de vencimentos (/vencimentos) do OHANA BOT:

Topo da página:
- Título "Vencimentos"
- 4 cards: "Vencem Hoje" (vermelho) | "Vencem em 3 dias" (amarelo) | "Em Atraso" (vermelho escuro) | "Pagos este mês" (verde)
- Botões para alternar visualização: "Calendário" e "Lista"

MODO LISTA (padrão):
- Tabela: Cliente | Título | Tipo | Vencimento | Valor | Status | Ações
- Filtros: Status (Todos/Aberto/Pago/Vencido/Cancelado) | Tipo | Mês/Ano
- Ordenar por data_vencimento crescente (mais próximo primeiro)
- Ações: "Marcar como Pago" (botão verde) | "Enviar WhatsApp" (ícone) | Editar | Excluir

MODO CALENDÁRIO:
- Calendário mensal
- Dias com vencimentos mostram um ponto colorido abaixo do número:
  - Azul = vencimento futuro
  - Amarelo = vence em até 3 dias
  - Vermelho = vencido
- Clicar no dia mostra painel lateral com os vencimentos daquele dia
- Navegação: setas para mês anterior e próximo mês

MODAL NOVO VENCIMENTO (ao clicar "Novo Vencimento"):
- Select de cliente (busca por nome)
- Título (texto)
- Tipo: select (DARF, DAS, GPS, FGTS, Honorários, Outro)
- Data de vencimento: date picker
- Valor: campo monetário
- Alertar X dias antes: número (padrão 3)
- Botão Salvar

Ao marcar como pago:
- Confirmar em modal: "Confirmar que foi pago?"
- Atualizar status para "pago" no Supabase
- Mostrar toast verde

Todos os dados vêm da tabela vencimentos com join em clientes do Supabase.
```

*Aguarde terminar antes de continuar.*

---

### PROMPT 7 — Configurações

```
Crie a página de configurações (/configuracoes) do OHANA BOT:

Layout com 3 abas:

ABA 1 - "WhatsApp":
- Campo "URL da Evolution API" (input de texto)
- Campo "Chave da API (apikey)" (input senha com botão mostrar/esconder)
- Campo "Nome da Instância" (padrão: ohana-bot)
- Campo "URL do Webhook n8n - Enviar Documento" (input de texto)
- Botão "Testar Conexão WhatsApp" — faz GET para {url}/instance/fetchInstances com header apikey
  - Se retornar status, mostrar badge verde "Conectado ✓"
  - Se der erro, mostrar badge vermelho "Desconectado ✗"

ABA 2 - "Mensagens":
- Textarea "Mensagem ao enviar documento"
  - Variáveis disponíveis (mostrar como chips clicáveis): {nome} {descricao} {competencia} {vencimento} {valor}
  - Clicar no chip insere a variável no cursor do textarea
- Textarea "Mensagem de alerta de vencimento" (mesmo esquema)
- Botão "Salvar Mensagens"

ABA 3 - "Escritório":
- Nome do escritório
- Telefone
- Email
- Botão "Salvar"

Todos os valores são lidos e salvos na tabela configuracoes do Supabase
(buscar por chave, salvar com upsert).
Mostrar toast "Configurações salvas!" ao salvar.
```

*Aguarde terminar antes de continuar.*

---

### PROMPT FINAL — Ajustes gerais

```
Faça os seguintes ajustes no OHANA BOT:

1. Em todas as tabelas: adicionar skeleton loading (linhas cinzas animadas) enquanto os dados carregam

2. Em todas as tabelas: quando não há dados, mostrar mensagem amigável com ícone:
   - Clientes: "Nenhum cliente cadastrado. Clique em Novo Cliente para começar!"
   - Documentos: "Nenhum documento encontrado."
   - Vencimentos: "Nenhum vencimento encontrado."

3. Ao excluir qualquer item: mostrar modal de confirmação antes de excluir:
   "Tem certeza que deseja excluir? Esta ação não pode ser desfeita."
   Botões: "Cancelar" (cinza) e "Excluir" (vermelho)

4. No celular (tela menor que 768px):
   - O menu lateral deve sumir e aparecer um botão ☰ no topo
   - Clicar no ☰ abre o menu em overlay
   - As tabelas mostram apenas as colunas mais importantes

5. Todas as datas devem ser formatadas em português (dd/mm/yyyy)

6. Valores monetários devem aparecer como R$ 1.234,56

7. Na lista de clientes, ao clicar no nome abre uma página /clientes/:id com:
   - Dados completos do cliente
   - Lista de documentos do cliente
   - Lista de vencimentos do cliente
   - Histórico de mensagens WhatsApp enviadas (tabela historico_whatsapp)
```

---

# PARTE 5 — EVOLUTION API NO RENDER.COM

## Instalar a Evolution API (programa de WhatsApp)

### Passo 1 — Acessar o Render

1. Acesse: **https://render.com**
2. Faça login com GitHub
3. Clique no botão azul **"New +"** no canto superior direito
4. Selecione **"Web Service"**

### Passo 2 — Configurar o serviço

1. Vai aparecer opções para escolher o repositório
2. Procure por **"Deploy an existing image from a registry"** e clique
3. No campo **"Image URL"** cole: `atendai/evolution-api:latest`
4. Clique em **"Next"**
5. Preencha:
   - **Name**: `ohana-evolution`
   - **Region**: `Oregon (US West)` (ou qualquer um)
   - **Instance Type**: `Free`

### Passo 3 — Adicionar variáveis de ambiente

Ainda na mesma página, role para baixo até encontrar **"Environment Variables"**.
Clique em **"Add Environment Variable"** e adicione cada linha abaixo:

| Key (copie exato) | Value (você define) |
|---|---|
| `AUTHENTICATION_TYPE` | `apikey` |
| `AUTHENTICATION_API_KEY` | `ohana2025secreto` |
| `AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES` | `true` |
| `DEL_INSTANCE` | `false` |
| `DATABASE_ENABLED` | `false` |
| `REDIS_ENABLED` | `false` |
| `WEBHOOK_GLOBAL_ENABLED` | `false` |

> A senha `ohana2025secreto` é um exemplo — crie uma sua, sem espaços e sem acentos.
> Salve essa senha no bloco de notas como `EVOLUTION API KEY`.

### Passo 4 — Criar o serviço

1. Clique no botão **"Create Web Service"** (ou "Deploy")
2. Vai aparecer uma tela com logs de deploy
3. Aguarde aparecer a mensagem **"Your service is live"** (pode demorar 5-10 minutos)
4. **Copie a URL** que aparece no topo (ex: `https://ohana-evolution.onrender.com`)
5. Salve no bloco de notas:
```
EVOLUTION API
  URL: https://ohana-evolution.onrender.com
  API KEY: ohana2025secreto (a que você definiu)
  Instance: ohana-bot
```

### Passo 5 — Criar a instância WhatsApp

Agora vamos "criar" seu número de WhatsApp no sistema:

1. Abra uma nova aba no Chrome
2. Cole este endereço (substitua pela sua URL):
   `https://ohana-evolution.onrender.com/manager`
3. Vai abrir uma interface visual (Swagger)
4. Procure por **"Instance"** → **"POST /instance/create"**
5. Clique em **"Try it out"**
6. No campo grande de texto, apague o que tem e cole:
```json
{
  "instanceName": "ohana-bot",
  "token": "ohana_token_2025",
  "qrcode": true,
  "integration": "WHATSAPP-BAILEYS"
}
```
7. No topo da página, procure por **"Authorize"** (botão com cadeado)
8. Cole sua API KEY (`ohana2025secreto`) → clique Authorize
9. Volte para o POST /instance/create → clique **"Execute"**
10. A resposta deve mostrar sucesso

### Passo 6 — Conectar seu WhatsApp (QR Code)

1. Na mesma interface Swagger, encontre **"GET /instance/connect/{instanceName}"**
2. Clique "Try it out"
3. No campo **instanceName**, digite: `ohana-bot`
4. Clique **"Execute"**
5. Na resposta você verá um texto longo que começa com `data:image/png;base64,...`
6. **Para ver o QR Code**: abra um novo site: **https://base64.guru/converter/decode/image**
7. Cole todo o texto base64 → clique "Decode Base64 to Image"
8. Vai aparecer um QR Code → **escaneie com seu WhatsApp**:
   - Abra o WhatsApp no celular
   - Toque nos 3 pontinhos (menu) → "Dispositivos conectados"
   - Toque em "Conectar um dispositivo"
   - Aponte a câmera para o QR Code
9. Pronto! Conectado!

### Verificar se está conectado

Faça uma requisição GET para:
`https://ohana-evolution.onrender.com/instance/fetchInstances`

Headers: `apikey: ohana2025secreto`

A resposta deve mostrar `"state": "open"` — significa CONECTADO! ✅

*Como fazer isso sem saber programar: use o Swagger conforme mostrado acima.*

---

# PARTE 6 — n8n NO RENDER.COM

## Instalar o n8n (automações)

### Passo 1 — Criar novo serviço no Render

1. No Render.com, clique em **"New +"** → **"Web Service"**
2. Escolha **"Deploy an existing image from a registry"**
3. Image URL: `n8nio/n8n`
4. Clique "Next"
5. Preencha:
   - **Name**: `ohana-n8n`
   - **Instance Type**: `Free`

### Passo 2 — Variáveis de ambiente do n8n

Adicione estas variáveis:

| Key | Value |
|---|---|
| `N8N_BASIC_AUTH_ACTIVE` | `true` |
| `N8N_BASIC_AUTH_USER` | `admin` |
| `N8N_BASIC_AUTH_PASSWORD` | `OhanaAdmin2025!` |
| `N8N_HOST` | `0.0.0.0` |
| `N8N_PORT` | `5678` |
| `WEBHOOK_URL` | `https://ohana-n8n.onrender.com` |
| `EVOLUTION_API_URL` | `https://ohana-evolution.onrender.com` |
| `EVOLUTION_API_KEY` | `ohana2025secreto` |

### Passo 3 — Criar o serviço

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (5-10 min)
3. Anote a URL (ex: `https://ohana-n8n.onrender.com`)

### Passo 4 — Acessar o n8n

1. Acesse a URL do seu n8n no Chrome
2. Vai pedir usuário e senha:
   - Usuário: `admin`
   - Senha: `OhanaAdmin2025!`
3. Você vai ver um canvas em branco — é o n8n!

---

## CRIAR FLUXO 1 — Alerta Diário de Vencimentos

*Este fluxo verifica todo dia às 9h quem tem vencimento próximo e manda WhatsApp.*

### Dentro do n8n, clique em "New Workflow"

**Adicione os nós na ordem:**

#### Nó 1: Schedule Trigger
- Clique no **"+"** no canvas
- Digite "Schedule" na busca → selecione "Schedule Trigger"
- Configure: Rule = "Every Day", Hour = 9, Minute = 0
- Clique "Back to canvas"

#### Nó 2: HTTP Request (buscar vencimentos do Supabase)
- Clique no **"+"** após o nó anterior
- Selecione "HTTP Request"
- Configure:
  - Method: `GET`
  - URL: `https://SUA-URL.supabase.co/rest/v1/vencimentos?select=*,clientes(nome,whatsapp)&status=eq.aberto&data_vencimento=lte.{{ $now.plus(3, 'days').toFormat('yyyy-MM-dd') }}&data_vencimento=gte.{{ $now.toFormat('yyyy-MM-dd') }}`
  - Headers → Add: 
    - `apikey`: (sua SUPABASE_ANON_KEY)
    - `Authorization`: `Bearer (sua SUPABASE_ANON_KEY)`

#### Nó 3: IF — Verificar se há resultados
- Adicione nó "IF"
- Condition: `{{ $json.length }}` > `0`

#### Nó 4: Split In Batches
- Adicione nó "Split In Batches"
- Batch Size: `1`

#### Nó 5: HTTP Request — Enviar WhatsApp
- Adicione nó "HTTP Request"
- Method: `POST`
- URL: `https://ohana-evolution.onrender.com/message/sendText/ohana-bot`
- Headers: `apikey: ohana2025secreto`
- Body (JSON):
```json
{
  "number": "{{ $json.clientes.whatsapp }}",
  "text": "Olá *{{ $json.clientes.nome }}*! 👋\n\nLembrete: o documento *{{ $json.titulo }}* vence em *{{ $json.data_vencimento }}*.\nValor: R$ {{ $json.valor }}\n\n_Ohana Contabilidade_ 🏢"
}
```

#### Nó 6: Salvar no histórico (HTTP Request para Supabase)
- Method: `POST`
- URL: `https://SUA-URL.supabase.co/rest/v1/historico_whatsapp`
- Headers: `apikey`, `Authorization`, `Content-Type: application/json`, `Prefer: return=minimal`
- Body:
```json
{
  "cliente_id": "{{ $json.cliente_id }}",
  "vencimento_id": "{{ $json.id }}",
  "telefone_destino": "{{ $json.clientes.whatsapp }}",
  "tipo_mensagem": "alerta",
  "mensagem_enviada": "Alerta de vencimento",
  "status_envio": "enviado"
}
```

**Clique em "Save"** (diskete no topo) → depois **"Activate"** (toggle no canto superior direito)

---

## CRIAR FLUXO 2 — Receber chamada do Lovable e enviar documento

#### Nó 1: Webhook
- Adicione "Webhook"
- HTTP Method: `POST`
- Path: `enviar-documento`
- **Copie a URL do webhook** → salve no bloco de notas
  `https://ohana-n8n.onrender.com/webhook/enviar-documento`

#### Nó 2: HTTP Request — Enviar texto
- URL: `https://ohana-evolution.onrender.com/message/sendText/ohana-bot`
- Method: POST
- Headers: `apikey: ohana2025secreto`
- Body:
```json
{
  "number": "{{ $json.body.cliente_whatsapp }}",
  "text": "Olá *{{ $json.body.cliente_nome }}*! 👋\n\nSegue seu documento: *{{ $json.body.documento_descricao }}*\nCompetência: {{ $json.body.competencia }}\nVencimento: {{ $json.body.vencimento }}\nValor: R$ {{ $json.body.valor }}\n\nO PDF está em anexo! 📎\n\n_Ohana Contabilidade_ 🏢"
}
```

#### Nó 3: HTTP Request — Enviar PDF
- URL: `https://ohana-evolution.onrender.com/message/sendMedia/ohana-bot`
- Method: POST
- Headers: `apikey: ohana2025secreto`
- Body:
```json
{
  "number": "{{ $json.body.cliente_whatsapp }}",
  "mediatype": "document",
  "mimetype": "application/pdf",
  "media": "{{ $json.body.pdf_url }}",
  "fileName": "{{ $json.body.documento_descricao }}.pdf",
  "caption": "{{ $json.body.documento_descricao }}"
}
```

#### Nó 4: Respond to Webhook
- Response Code: 200
- Body: `{"ok": true}`

**Salve e Ative o fluxo.**

---

# PARTE 7 — CONECTAR O LOVABLE AO n8n

## Colocar a URL do webhook nas configurações

1. Abra seu sistema no Lovable
2. Vá em **Configurações** (no menu lateral)
3. Aba **WhatsApp**
4. Campo **"URL da Evolution API"**: cole `https://ohana-evolution.onrender.com`
5. Campo **"Chave da API"**: cole `ohana2025secreto`
6. Campo **"URL do Webhook n8n - Enviar Documento"**: cole `https://ohana-n8n.onrender.com/webhook/enviar-documento`
7. Clique **"Salvar"**

---

# PARTE 8 — TESTAR TUDO

## Teste completo (siga essa ordem)

### Teste 1 — Login
1. Acesse seu sistema no Lovable (URL no canto superior do Lovable)
2. Tente fazer login com o email e senha que você criou no Supabase
3. ✅ Deve ir para o Dashboard

### Teste 2 — Cadastrar cliente
1. Vá em Clientes → Novo Cliente
2. Preencha com dados reais (pode ser você mesmo)
3. Salve
4. ✅ Deve aparecer na lista e no Supabase (Table Editor → clientes)

### Teste 3 — Upload de documento
1. Prepare um PDF qualquer (pode ser um extrato de conta)
2. Vá em Documentos → Novo Documento
3. Selecione o cliente que você criou
4. Preencha os dados
5. Arraste o PDF para a área de upload
6. Marque "Enviar por WhatsApp"
7. Salve
8. ✅ PDF deve aparecer no Supabase Storage
9. ✅ WhatsApp deve receber a mensagem e o PDF

### Teste 4 — Vencimento automático
1. Vá em Vencimentos
2. Crie um vencimento com a data de hoje
3. Aguarde às 9h do dia seguinte (ou execute o fluxo manualmente no n8n)
4. ✅ WhatsApp deve receber o alerta

---

# PROBLEMAS MAIS COMUNS

| O que aconteceu | O que fazer |
|---|---|
| Render.com "serviço dormindo" | Acesse a URL do serviço — ele acorda em ~30 segundos |
| QR Code expirou | Chame GET /instance/connect/ohana-bot de novo |
| Supabase deu erro de permissão | Execute novamente o SQL 10 (RLS) |
| Lovable não conecta ao Supabase | Verifique se URL e KEY estão corretos nas variáveis |
| WhatsApp não recebe | Verifique se o número está no formato: 5511999999999 |
| n8n não roda o fluxo | Verifique se o fluxo está "Activated" (toggle azul) |

---

# SUAS SENHAS (preencha conforme vai avançando)

```
============================================================
OHANA BOT — REGISTRO DE ACESSO
============================================================

GITHUB
  Email: ___________________________
  Senha: ___________________________

SUPABASE
  URL do Projeto: https://_____________.supabase.co
  Chave Anon (pública): eyJ_________________________
  Chave Service Role (privada): eyJ_________________
  Senha do Banco: ___________________________

LOVABLE
  URL do Sistema: https://_____________.lovable.app
  Login: mesmo do GitHub

RENDER.COM
  Login: mesmo do GitHub

EVOLUTION API
  URL: https://ohana-evolution.onrender.com
  API Key: ___________________________
  Nome da Instância: ohana-bot

n8n
  URL: https://ohana-n8n.onrender.com
  Usuário: admin
  Senha: ___________________________
  Webhook enviar documento: https://ohana-n8n.onrender.com/webhook/enviar-documento

SISTEMA (login)
  Email: ___________________________
  Senha: ___________________________
============================================================
```

---

> Se travar em qualquer passo, me diga exatamente:
> 1. Em qual parte está
> 2. O que você fez
> 3. O que apareceu na tela (pode tirar print)
> Que eu ajudo você resolver!
