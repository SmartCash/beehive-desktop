const random = require('random');

let sapis = [`https://sapi.smartcash.cc`];

let sapiAddress = `https://sapi.smartcash.cc`;

if (window.location.protocol === 'http:') {
    sapiAddress = sapis[random.int(0, sapis.length - 1)];
}

module.exports = () => sapiAddress;
