const path = require('path');
const cron = require('cron').CronJob;
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');

const domain = process.env.CLOUDFLARE_DOMAIN; 
const subdomains = process.env.CLOUDFLARE_SUBDOMAIN.split(",");;
const apiEndPt = 'https://api.cloudflare.com/client/v4';


axios.defaults.headers.common['X-Auth-Email'] = process.env.CLOUDFLARE_EMAIL;
axios.defaults.headers.common['X-Auth-Key']   = process.env.CLOUDFLARE_TOKEN;
axios.defaults.headers.common['Content-Type'] = 'application/json';

var ip_atual;
var zone_id;

async function getMyIp(){
  await axios.get('https://api.ipify.org/')
  .then(function (response) {
    ip_atual = response.data;
  })
  .catch(function (error) {
    console.error(error);
  })
}

async function getDnsZone(){
  await axios.get(apiEndPt + `/zones?name=${domain}&status=active`)
  .then(function (response) {
    return zone_id = response.data.result[0].id
  })
  .catch(function (error) {
    console.error(error);
  })
}

async function getDnsIP(zone_id){
  subdomains.forEach(async (subdomain) => {

    let ts = Date.now();
    
    await axios.get(apiEndPt + `/zones/${zone_id}/dns_records?type=A&name=${subdomain}`)
    .then((response) =>{
      //TODO: CRIAR UMA VALIDACAO PARA SE O SUBDOMAIN IS NULL (NAO EXISTE NO CLOUDFLARE)
      if(response.data.result[0].content == null){
        console.log('O Subdomin nao existe');
      }
      else if(response.data.result[0].content != ip_atual){
        updateDnsIP(zone_id,response.data.result[0])
        console.log(`${ts}: O IP para o ${subdomain} foi atualizado de ${response.data.result[0].content} para ${ip_atual}`)
      }else{
       console.log(`${ts}: O IP para o ${subdomain} nao precisou de IP para ${ip_atual}`)
      }
    }).catch(function (error){
      console.log('error');
    })
  })
}

async function updateDnsIP(zone_id,obj){
  await axios.put(apiEndPt + `/zones/${zone_id}/dns_records/${obj.id}`,
  {
    type:"A",
    name: obj.name,
    content: ip_atual,
    ttl:3600,
    proxied:false
  }).catch(function(error){
    console.log('aqio');
    console.log(error);
  })
}

var start = async () =>{

  await getMyIp();

  await getDnsZone();

  await getDnsIP(zone_id);

}

var jobUpdate = new cron('*/30 * * * *', () => {
  start();
});

jobUpdate.start();