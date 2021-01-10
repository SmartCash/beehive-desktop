const random = require('random');

let sapis = [
    `http://23.227.167.45:8080`,
];

let sapiAddress = `http://23.227.167.45:8080`;

if (window.location.protocol === 'http:') {
    sapiAddress = sapis[random.int(0, sapis.length - 1)];
}

console.log(sapiAddress);

module.exports = () => sapiAddress;
