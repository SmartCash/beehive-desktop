const random = require('random');

let sapis = ['https://sapi2.smartcash.org', 'https://core-sapi.smartcash.cc'];

module.exports = () => sapis[random.int( 0,  (sapis.length - 1))];
