const random = require('random');
const request = require('request-promise');

let sapis = [
    `http://64.44.52.40:8080`,
    `http://167.86.103.167:8080`,
    `http://90.145.247.78:8080`,
    `http://90.145.247.54:8080`,
    `http://62.171.171.66:8080`,
    `http://195.201.12.93:8080`,
    `http://167.86.79.4:8080`,
    `http://135.181.85.180:8080`,
    `http://135.181.85.177:8080`,
    `http://135.181.85.186:8080`,
    `http://135.181.85.188:8080`,
    `http://135.181.85.176:8080`,
    `http://135.181.85.183:8080`,
    `http://135.181.85.184:8080`,
    `http://135.181.85.187:8080`,
    `http://135.181.85.182:8080`,
    `http://135.181.85.185:8080`,
    `http://195.201.22.100:8080`,
    `http://195.201.22.122:8080`,
    `http://195.201.22.110:8080`,
    `http://195.201.22.103:8080`,
    `http://195.201.22.112:8080`,
    `http://195.201.22.113:8080`,
    `http://195.201.22.117:8080`,
    `http://195.201.22.101:8080`,
];

if (window.location.protocol === 'https:') {
    sapis = sapis[`https://sapi.smartcash.cc`];
}

/*
request.get('https://sapi.smartcash.ccsmartnodes/list').then((list) => {
    list = JSON.parse(list);

    const mappedKey = Object.keys(list).map((key) => {
        return list[key];
    });

    const serves = mappedKey
        .filter((f) => f.protocol === 90030 && f.status === 'ENABLED')
        .map((server) => {
            return {
                status: server.status,
                protocol: server.protocol,
                payee: server.payee,
                uptime: server.uptime,
                ip_sapi: server.ip.split(':')[0] + ':8080',
                ip: server.ip,
            };
        });
    if (serves.length > 0) {
        sapis = serves.map((server) => 'http://' + server.ip_sapi);
    }
});*/
module.exports = () => sapis[random.int(0, sapis.length - 1)];
