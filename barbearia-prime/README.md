# Barbearia Prime — Agendamento

MVP operacional de agendamento para barbearia premium, construído em **React + Vite + TypeScript + Tailwind CSS**.

> ⚠️ **Este é um MVP demonstrativo.** Os dados são simulados em memória (sem banco de dados real). A estrutura está preparada para integração com Supabase + Row Level Security.

---

## Stack

- React 18 + TypeScript
- Vite 5
- React Router 6
- Tailwind CSS 3
- Lucide React (ícones)
- date-fns

---

## Instalação e uso local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/barbearia-prime.git
cd barbearia-prime

# 2. Instale as dependências
npm install

# 3. Copie as variáveis de ambiente
cp .env.example .env

# 4. Rode em desenvolvimento
npm run dev
# Acesse: http://localhost:5173

# 5. Build de produção
npm run build
# Saída em: dist/

# 6. Preview do build
npm run preview
```

---

## Deploy no Netlify

### Opção 1 — GitHub + Netlify (recomendado)

1. Faça push do projeto para um repositório GitHub
2. Acesse [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
3. Selecione o repositório
4. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Clique em **Deploy site**

O arquivo `netlify.toml` já está configurado com os redirects necessários para React Router funcionar corretamente.

### Opção 2 — Deploy manual (drag & drop)

```bash
npm run build
# Arraste a pasta dist/ para netlify.com/drop
```

### Variáveis de ambiente no Netlify

No painel do Netlify, vá em **Site settings → Environment variables** e adicione:

```
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
VITE_WHATSAPP_NUMBER=5511999990000
```

**Nunca commite valores reais no `.env`.**

---

## Estrutura do projeto

```
src/
├── components/
│   └── layout/
│       ├── PublicLayout.tsx    # Nav + footer do site público
│       └── AdminLayout.tsx     # Sidebar + header do painel admin
├── pages/
│   ├── client/
│   │   ├── Home.tsx
│   │   ├── Services.tsx
│   │   ├── Barbers.tsx
│   │   ├── Booking.tsx         # Fluxo completo de agendamento
│   │   ├── MyAppointments.tsx
│   │   ├── Profile.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Terms.tsx
│   │   └── Privacy.tsx
│   └── admin/
│       ├── AdminLogin.tsx
│       ├── Dashboard.tsx
│       ├── Agenda.tsx
│       ├── AdminBarbers.tsx
│       ├── AdminServices.tsx
│       ├── AdminSchedule.tsx
│       ├── AdminClients.tsx
│       └── AdminConfig.tsx
├── store/
│   └── AppContext.tsx           # Estado global (substituir por Supabase)
├── lib/
│   ├── dates.ts                 # Utilitários de data sem UTC drift
│   ├── slots.ts                 # Cálculo de horários disponíveis
│   ├── sanitize.ts              # Sanitização de inputs
│   └── whatsapp.ts              # Links WhatsApp (apenas número oficial)
├── types/
│   └── index.ts                 # Tipos TypeScript
├── App.tsx                      # Rotas
├── main.tsx
└── index.css                    # Temas dark/gray/light + utilitários
```

---

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Home pública |
| `/servicos` | Lista de serviços |
| `/barbeiros` | Equipe de barbeiros |
| `/agendar` | Fluxo de agendamento (5 etapas) |
| `/meus-agendamentos` | Agendamentos do cliente logado |
| `/perfil` | Perfil do cliente |
| `/login` | Login do cliente |
| `/cadastro` | Cadastro do cliente |
| `/termos-de-uso` | Termos de Uso |
| `/politica-de-privacidade` | Política de Privacidade (LGPD) |
| `/admin/login` | Login do administrador |
| `/admin/dashboard` | Painel principal |
| `/admin/agenda` | Gestão de agendamentos |
| `/admin/barbeiros` | CRUD de barbeiros |
| `/admin/servicos` | CRUD de serviços |
| `/admin/horarios` | Configuração de horários, feriados, bloqueios |
| `/admin/clientes` | Lista de clientes (protegida) |
| `/admin/configuracoes` | Configurações da barbearia |

---

## Segurança implementada no MVP

- ✅ Dados do cliente não expostos em rotas públicas
- ✅ Área admin protegida por `AdminGuard` (redireciona para login)
- ✅ WhatsApp do barbeiro não exposto ao cliente (apenas número oficial da barbearia)
- ✅ Checkbox LGPD obrigatório, não pré-marcado por padrão
- ✅ Consentimento registrado com data/hora e versão dos termos
- ✅ Agendamentos do cliente filtrados por `sessionId`
- ✅ Inputs sanitizados (XSS básico)
- ✅ Datas tratadas como `YYYY-MM-DD` local (sem UTC drift)
- ✅ Nenhuma credencial hardcoded no frontend
- ⚠️ **Em produção:** substituir mock store por Supabase Auth + RLS

---

## Preparação para Supabase

### 1. Instalar cliente

```bash
npm install @supabase/supabase-js
```

### 2. Criar `src/lib/supabaseClient.ts`

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis Supabase não configuradas. Veja .env.example')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. Tabelas necessárias

```sql
-- barbers, services, appointments, schedule, holidays, blocked_slots, config
```

### 4. Row Level Security (RLS) — regras essenciais

```sql
-- Cliente vê apenas seus próprios agendamentos
CREATE POLICY "client_own_appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id);

-- Admin vê todos
CREATE POLICY "admin_all" ON appointments
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Página pública pode criar agendamento
CREATE POLICY "public_insert" ON appointments
  FOR INSERT WITH CHECK (true);
```

---

## LGPD — Estrutura de consentimento

```ts
{
  consentimentoAceito: true,
  dataHoraConsentimento: "2025-05-07T14:32:00.000Z",
  versaoPoliticaPrivacidade: "v1.0",
  versaoTermosUso: "v1.0",
  origemConsentimento: "agendamento"
}
```

---

## O que NÃO está no escopo

- Pagamento online
- Multiempresa / múltiplos segmentos
- Estoque / comissão / financeiro complexo
- App mobile nativo
- WhatsApp Business API real (simulado no MVP)
- Assinatura SaaS

---

## Licença

Uso privado — MVP da Barbearia Prime.
