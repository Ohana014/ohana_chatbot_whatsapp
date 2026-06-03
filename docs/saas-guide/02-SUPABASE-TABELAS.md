# OHANA BOT — Módulo 2: Supabase (Banco de Dados)

---

## PASSO A PASSO PARA CRIAR O BANCO

### PASSO 1 — Criar conta no Supabase

1. Acesse: **https://supabase.com**
2. Clique no botão verde **"Start your project"**
3. Clique em **"Sign in with GitHub"** (precisa ter conta no GitHub — se não tiver, crie em github.com)
4. Autorize o acesso

### PASSO 2 — Criar um projeto

1. Clique em **"New Project"**
2. Preencha:
   - **Name**: `ohana-bot`
   - **Database Password**: crie uma senha forte (ex: `OhanaBot@2025!`) — SALVE essa senha!
   - **Region**: `South America (São Paulo)`
3. Clique em **"Create new project"**
4. Aguarde ~2 minutos (vai aparecer uma tela de carregamento)

### PASSO 3 — Pegar as chaves do projeto

1. No menu esquerdo, clique em **"Project Settings"** (ícone de engrenagem)
2. Clique em **"API"**
3. Copie e salve:
   - **Project URL** → é o seu `SUPABASE_URL`
   - **anon public** (em "Project API keys") → é o seu `SUPABASE_ANON_KEY`

### PASSO 4 — Abrir o Editor SQL

1. No menu esquerdo, clique em **"SQL Editor"** (ícone de banco de dados)
2. Clique em **"New query"**
3. Copie e cole os SQLs abaixo um de cada vez, clicando em **"Run"** após cada um

---

## SQL 1 — Habilitar UUID (copie e cole, depois clique RUN)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## SQL 2 — Tabela de CLIENTES

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

COMMENT ON TABLE clientes IS 'Clientes do escritório contábil';
```

---

## SQL 3 — Tabela de EMPRESAS (dos clientes PJ)

```sql
CREATE TABLE empresas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  inscricao_estadual VARCHAR(30),
  inscricao_municipal VARCHAR(30),
  regime_tributario VARCHAR(30) DEFAULT 'Simples Nacional'
    CHECK (regime_tributario IN ('Simples Nacional', 'Lucro Presumido', 'Lucro Real', 'MEI')),
  cnae VARCHAR(10),
  data_abertura DATE,
  socios TEXT,
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE empresas IS 'Empresas vinculadas aos clientes PJ';
```

---

## SQL 4 — Tabela de DOCUMENTOS (guias, boletos, certidões)

```sql
CREATE TABLE documentos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  tipo VARCHAR(50) NOT NULL
    CHECK (tipo IN (
      'DARF', 'DAS', 'GPS', 'FGTS', 'IRPF', 'IRPJ',
      'CSLL', 'PIS', 'COFINS', 'ISS', 'ICMS',
      'Holerite', 'Contrato', 'Certidao', 'Outro'
    )),
  descricao VARCHAR(255) NOT NULL,
  competencia VARCHAR(7),      -- formato: 2025-01 (ano-mes)
  data_vencimento DATE,
  valor DECIMAL(15,2),
  status VARCHAR(20) DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'enviado', 'pago', 'vencido', 'cancelado')),
  arquivo_url TEXT,            -- link do PDF no Supabase Storage
  arquivo_nome VARCHAR(255),
  enviado_whatsapp BOOLEAN DEFAULT false,
  data_envio_whatsapp TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE documentos IS 'Documentos, guias e PDFs dos clientes';
```

---

## SQL 5 — Tabela de VENCIMENTOS (agenda de cobranças)

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
  tipo VARCHAR(50),             -- ex: DARF, DAS, Honorários
  status VARCHAR(20) DEFAULT 'aberto'
    CHECK (status IN ('aberto', 'pago', 'vencido', 'cancelado')),
  alertar_dias_antes INTEGER DEFAULT 3,  -- avisar 3 dias antes
  alertas_enviados INTEGER DEFAULT 0,
  ultimo_alerta_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE vencimentos IS 'Controle de prazos e vencimentos';
```

---

## SQL 6 — Tabela de HISTÓRICO DE ENVIOS WHATSAPP

```sql
CREATE TABLE historico_whatsapp (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  documento_id UUID REFERENCES documentos(id) ON DELETE SET NULL,
  vencimento_id UUID REFERENCES vencimentos(id) ON DELETE SET NULL,
  telefone_destino VARCHAR(20) NOT NULL,
  tipo_mensagem VARCHAR(30)
    CHECK (tipo_mensagem IN ('documento', 'cobranca', 'alerta', 'aviso', 'outro')),
  mensagem_enviada TEXT,
  status_envio VARCHAR(20) DEFAULT 'enviado'
    CHECK (status_envio IN ('enviado', 'entregue', 'lido', 'erro')),
  resposta_cliente TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE historico_whatsapp IS 'Histórico de todas as mensagens WhatsApp enviadas';
```

---

## SQL 7 — Tabela de USUÁRIOS DO SISTEMA (contadores/funcionários)

```sql
CREATE TABLE usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_id UUID UNIQUE,          -- vinculado ao Supabase Auth
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  perfil VARCHAR(20) DEFAULT 'operador'
    CHECK (perfil IN ('admin', 'contador', 'operador')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE usuarios IS 'Usuários internos do escritório';
```

---

## SQL 8 — Configurações do Sistema

```sql
CREATE TABLE configuracoes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT,
  descricao TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('evolution_api_url', '', 'URL da sua Evolution API'),
  ('evolution_api_key', '', 'Chave da Evolution API'),
  ('evolution_instance', 'ohana-bot', 'Nome da instância WhatsApp'),
  ('dias_alerta_vencimento', '3', 'Quantos dias antes avisar o cliente'),
  ('mensagem_documento', 'Olá *{nome}*! 👋\n\nSegue o documento: *{descricao}*\nCompetência: {competencia}\nVencimento: {vencimento}\n\n📎 O arquivo está em anexo.\n\nQualquer dúvida, estamos à disposição!\n\n_Ohana Contabilidade_', 'Mensagem padrão ao enviar documento'),
  ('mensagem_cobranca', 'Olá *{nome}*! 👋\n\nPassando para lembrar que o seguinte documento está vencendo em breve:\n\n📋 *{descricao}*\n💰 Valor: R$ {valor}\n📅 Vencimento: {vencimento}\n\nQualquer dúvida, entre em contato!\n\n_Ohana Contabilidade_', 'Mensagem de cobrança/alerta de vencimento');
```

---

## SQL 9 — Criar Storage para PDFs

```sql
-- Criar bucket público para documentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true);

-- Política: qualquer usuário autenticado pode fazer upload
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

-- Política: leitura pública dos documentos
CREATE POLICY "Public can view documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documentos');
```

---

## SQL 10 — Índices para performance (consultas rápidas)

```sql
CREATE INDEX idx_documentos_cliente ON documentos(cliente_id);
CREATE INDEX idx_documentos_vencimento ON documentos(data_vencimento);
CREATE INDEX idx_documentos_status ON documentos(status);
CREATE INDEX idx_vencimentos_data ON vencimentos(data_vencimento);
CREATE INDEX idx_vencimentos_status ON vencimentos(status);
CREATE INDEX idx_historico_cliente ON historico_whatsapp(cliente_id);
```

---

## VERIFICANDO SE DEU CERTO

Após rodar todos os SQLs, no menu esquerdo clique em **"Table Editor"**.
Você deve ver as tabelas:
- ✅ clientes
- ✅ empresas
- ✅ documentos
- ✅ vencimentos
- ✅ historico_whatsapp
- ✅ usuarios
- ✅ configuracoes

---

## PRÓXIMO PASSO

👉 Vá para o arquivo `03-LOVABLE-PROMPTS.md` para criar a tela do sistema.
