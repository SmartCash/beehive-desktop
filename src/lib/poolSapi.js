const random = require("random");

let sapis = ["https://sapi2.smartcash.org"];

module.exports = () => sapis[random.int(0, sapis.length - 1)];
