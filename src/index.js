const path = require('path');
const { CronJob } = require('cron');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');

// Configuração de variáveis de ambiente
const domain = process.env.CLOUDFLARE_DOMAIN;
const subdomains = process.env.CLOUDFLARE_SUBDOMAIN.split(';');
const cronSchedule = process.env.CRON_SCHEDULE || '*/30 * * * *';
const apiEndPt = 'https://api.cloudflare.com/client/v4';

// Configuração global do Axios
axios.defaults.headers.common['X-Auth-Email'] = process.env.CLOUDFLARE_EMAIL;
axios.defaults.headers.common['Authorization'] = process.env.CLOUDFLARE_TOKEN;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Função para obter o IP atual
async function getMyIp() {
  try {
    const response = await axios.get('https://api.ipify.org/');
    return response.data;
  } catch (error) {
    console.error('[getMyIp] Erro ao obter IP:', error.message);
    throw error;
  }
}

// Função para obter o Zone ID
async function getDnsZone() {
  try {
    const response = await axios.get(`${apiEndPt}/zones?name=${domain}&status=active`);
    if (response.data.result.length === 0) {
      throw new Error('Zone não encontrada');
    }
    return response.data.result[0].id;
  } catch (error) {
    console.log(error)
    console.error('[getDnsZone] Erro ao obter Zone ID:', error.message);
    throw error;
  }
}

// Função para obter registro DNS de um subdomínio
async function getDnsRecord(zone_id, subdomain) {
  try {
    const response = await axios.get(`${apiEndPt}/zones/${zone_id}/dns_records?type=A&name=${subdomain}.${domain}`);
    return response.data.result[0] || null;
  } catch (error) {
    console.error(`[getDnsRecord] Erro ao obter registro DNS para ${subdomain}:`, error.message);
    return null;
  }
}

// Função para atualizar registro DNS
async function updateDnsIP(zone_id, record, ip) {
  try {
    await axios.put(`${apiEndPt}/zones/${zone_id}/dns_records/${record.id}`, {
      type: 'A',
      name: record.name,
      content: ip,
      ttl: 3600,
      proxied: false,
    });
    console.log(`[updateDnsIP] Registro DNS atualizado para ${record.name}: ${ip}`);
  } catch (error) {
    console.error(`[updateDnsIP] Erro ao atualizar DNS para ${record.name}:`, error.message);
  }
}

// Função principal de atualização
async function updateAllDnsRecords() {
  try {
    const ipAtual = await getMyIp();
    const zoneId = await getDnsZone();

    for (const subdomain of subdomains) {
      const record = await getDnsRecord(zoneId, subdomain);

      if (!record) {
        console.warn(`[updateAllDnsRecords] Subdomínio ${subdomain} não encontrado no Cloudflare.`);
        continue;
      }

      if (record.content !== ipAtual) {
        await updateDnsIP(zoneId, record, ipAtual);
      } else {
        console.log(`[updateAllDnsRecords] IP de ${subdomain} já está atualizado (${ipAtual}).`);
      }
    }
  } catch (error) {
    console.error('[updateAllDnsRecords] Erro geral:', error.message);
  }
}

// Cron Job para rodar a cada 30 minutos
const jobUpdate = new CronJob(cronSchedule, updateAllDnsRecords);

// Inicia o job
jobUpdate.start();
console.log('Cloudflare DNS Updater iniciado.');
