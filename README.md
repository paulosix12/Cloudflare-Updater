# Cloudflare Dynamic DNS Updater

Atualize automaticamente o IP dos seus subdomínios no Cloudflare usando Node.js e Docker. Ideal para quem tem IP dinâmico em casa e quer acessar serviços remotamente, sem depender de soluções pagas.

## 🚀 O que é isso?

Esse projeto é uma POC (Prova de Conceito) para gerenciar registros DNS do seu domínio na Cloudflare, atualizando o IP sempre que ele mudar. Útil para quem hospeda serviços em casa e precisa de um "Dynamic DNS" próprio, simples e eficiente.

> **Atenção:** Não é uma solução enterprise! Use por sua conta e risco. Se precisa de alta disponibilidade, procure por serviços profissionais como NOIP, desec.io, DuckDNS, etc.

---

## 🛠️ Como usar

### 1. Pré-requisitos

- Conta na [Cloudflare](https://www.cloudflare.com/)
- Node.js ou Docker instalado
- Um domínio gerenciado pela Cloudflare


### 2. Gere um token de API

No painel da Cloudflare, crie um **API Token** com permissão para editar zonas DNS.

### 3. Configure o `.env`

Crie um arquivo `.env` na raiz do projeto, seguindo o exemplo abaixo:

```env
CLOUDFLARE_TOKEN=Bearer SEUTOKENAQUI
CLOUDFLARE_EMAIL=seuemail@mail.com.br
CLOUDFLARE_DOMAIN=seudominio.com.br
CLOUDFLARE_SUBDOMAIN=subdominio1;subdominio2
# Opcional: agendamento do cron (padrão: a cada 30 minutos)
# CRON_SCHEDULE=*/30 * * * *
```


### 4. Execute com Docker

```bash
docker pull paulosix12/cloudflareupdater:latest
docker run --env-file .env paulosix12/cloudflareupdater:latest
```


### 5. Ou rode localmente

```bash
npm install
node src/index.js
```


---

## ⚙️ Como funciona

- Descobre seu IP público atual
- Busca o Zone ID do seu domínio
- Atualiza o(s) registro(s) A dos subdomínios informados, caso o IP tenha mudado
- Repete o processo periodicamente (por padrão, a cada 30 minutos)

---

## 📝 Exemplo de uso

```env
CLOUDFLARE_TOKEN=Bearer 1234567890abcdef
CLOUDFLARE_EMAIL=meuemail@dominio.com
CLOUDFLARE_DOMAIN=meudominio.com
CLOUDFLARE_SUBDOMAIN=home;vpn;camera
```


---

## 📦 Estrutura do projeto

- `src/index.js` — Código principal do updater
- `.env.example` — Exemplo de configuração

---

## 🧑‍💻 Contribua!

Achou um bug? Tem uma ideia de melhoria? Pull requests são super bem-vindos!

---

## 📄 Licença

MIT — faça bom uso!

---

## 💬 Dúvidas?

Abra uma issue ou mande um comentário!

---