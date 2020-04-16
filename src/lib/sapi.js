const smartCash = require('smartcashjs-lib');
const request = require('request-promise');
const _ = require('lodash');
let getSapiUrl = require('./poolSapi');

module.exports = async function createAndSendRawTransaction(toAddress, amount, keyString) {

    let key = smartCash.ECPair.fromWIF(keyString);

    let fromAddress = key.getAddress().toString();

    let transaction = new smartCash.TransactionBuilder();

    let sapiUnspent = await getUnspent(fromAddress, amount);

    let totalUnspent = _.sumBy(sapiUnspent.utxos, 'amount');

    let fee = calculateFee(sapiUnspent.utxos);

    let change = (totalUnspent - amount - fee);

    if (totalUnspent < (amount + fee))
        throw new Error("The amount exceeds your balance!");

    if (amount < 0.001)
        throw new Error("The amount is smaller than the minimum accepted. Minimum amount: 0.001.");

    transaction.setLockTime(sapiUnspent.blockHeight);

    //SEND TO
    transaction.addOutput(toAddress, parseFloat(smartCash.amount(amount.toString()).toString()));

    if (change >= fee) {
        //Change TO
        transaction.addOutput(fromAddress, parseFloat(smartCash.amount(change.toString()).toString()));
    } else {
        fee = change;
    }

    //Add unspent and sign them all
    if (!_.isUndefined(sapiUnspent.utxos) && sapiUnspent.utxos.length > 0) {

        sapiUnspent.utxos.forEach((element) => {
            transaction.addInput(element.txid, element.index);
        });

        for (let i = 0; i < sapiUnspent.utxos.length; i += 1) {
            transaction.sign(i, key);
        }
    }

    try {
        let signedTransaction = transaction.build().toHex();
        return await sendTransaction(signedTransaction);
    } catch (err) {
        console.error(err);
        throw err;
    }
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

async function sendTransaction(hex) {
    var options = {
        method: 'POST',
        uri: `${getSapiUrl()}/v1/transaction/send`,
        body: {
            data: `${hex}`,
            instantpay: false,
            overrideFees: false
        },
        json: true // Automatically stringifies the body to JSON
    };

    try {
        return await request.post(options);
    } catch (err) {
        throw err;
    }
}