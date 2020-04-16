const request = require('request-promise');
const getSapiUrl = require('./poolSapi');

module.exports = async function calculateFeeFee(amount, fromAddress) {

    let sapiUnspent = await getUnspent(fromAddress, amount);

    let fee = calculateFee(sapiUnspent.utxos);

    return fee;
};

function calculateFee(listUnspent) {

    let fee = 0.002;

    let countUnspent = listUnspent.length;

    var newFee = (((countUnspent * 148) + (2 * 34) + 10 + 9) / 1024) * fee;

    newFee = (0.00003 + (((countUnspent * 148) + (2 * 34) + 10 + 9) / 1024)) * fee;

    if (newFee > fee)
        fee = newFee;

    return roundUp(fee, 4);
}

function roundUp(num, precision) {
    precision = Math.pow(10, precision)
    return Math.ceil(num * precision) / precision
}

async function getUnspent(_address, _amount) {
    var options = {
        method: 'POST',
        uri: `${getSapiUrl()}/v1/address/unspent/amount`,
        body: {
            address: _address,
            amount: _amount,
            random: true,
            instantpay: false
        },
        json: true
    };

    try {
        return await request.post(options);
    } catch (err) {
        throw err;
    }
}
