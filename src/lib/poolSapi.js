const random = require("random");

let sapis = ["https://sapi2.smartcash.org", "https://sapi.smartcash.cc"];

module.exports = () => sapis[random.int(0, sapis.length - 1)];
