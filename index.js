// var cron = require('node-cron');
const axios = require('axios');
const { Console } = require('console');
const fs = require('fs');
const Token = '933f665692a1996f711cb4a462bb411c71688'; //DEFINIR NO DOTENV
const domain = 'pauloedu.com.br'; //DEFINIR NO DOTENV
var subdomains = ['vpn.pauloedu.com.br','sixterserver.pauloedu.com.br'] //DEFINIR NO DOTENV
const email = '' //TODO DEFINIR NO DOTENV


const apiEndPt = 'https://api.cloudflare.com/client/v4';
axios.defaults.headers.common['X-Auth-Email'] = 'paulo_edu_12@hotmail.com';
axios.defaults.headers.common['X-Auth-Key'] =  Token;
axios.defaults.headers.common['Content-Type'] = 'application/json';


var ip_atual;
var zone_id;

async function getMyIp(){
  await axios.get('https://api.ipify.org/')
  .then(function (response) {
    // manipula o sucesso da requisição
    ip_atual = response.data;
  })
  .catch(function (error) {
    // manipula erros da requisição
    console.error(error);
  })
  .then(function () {
    // sempre será executado
  });
}

async function getDnsZone(){
  await axios.get(apiEndPt + '/zones?name=pauloedu.com.br&status=active')
  .then(function (response) {
    return zone_id = response.data.result[0].id
  })
  .catch(function (error) {
    // manipula erros da requisição
    console.error(error);
  })
}

async function getDnsIP(zone_id){
  subdomains.forEach(async (subdomain) => {

    let ts = Date.now();
    
    await axios.get(apiEndPt + `/zones/${zone_id}/dns_records?type=A&name=${subdomain}`)
    .then((response) =>{
      //TODO: CRIAR UMA VALIDACAO PARA SE O SUBDOMAIN IS NULL (NAO EXISTE NO CLOUDFLARE)
      if(response.data.result[0].content != ip_atual){
        updateDnsIP(zone_id,response.data.result[0])
        console.log(`${ts}: O IP para o ${subdomain} foi atualizado de ${response.data.result[0].content} para ${ip_atual}`)
      }else{
       console.log(`${ts}: O IP para o ${subdomain} nao precisou de IP para ${ip_atual}`)
      }
    })
  })
}

async function updateDnsIP(zone_id,obj){
try {
  await axios.put(apiEndPt + `/zones/${zone_id}/dns_records/${obj.id}`,
  {
    "type":"A",
    "name": obj.name,
    "content": ip_atual,
    "ttl":3600,
    "proxied":false
  }).then(()=>{
    console.log(`atualizouuuu`)
  })
  
} catch (error) {
  console.log(error)
} 
  // await axios.get(apiEndPt + `/zones/${zone_id}/dns_records?type=A&name=${subdomain}`)
  // .then(()=>{

  // })
}

var start = async () =>{


  //Get my actual IP
  await getMyIp();

  await getDnsZone();

  await getDnsIP(zone_id);

}

start();

// cron.schedule('*/30 * * * *', () => {
//   start();
// });