const random = require('random');

const request = require('request-promise');

let sapis = ['https://sapi2.smartcash.org', 'https://sapi.smartcash.cc'];
/*
request.get('https://sapi.smartcash.cc/v1/smartnodes/list').then((list) => {
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
