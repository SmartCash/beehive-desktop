import { sumFloats } from './math';

const smartCash = require('smartcashjs-lib');
const request = require('request-promise');
const _ = require('lodash');
let getSapiUrl = require('./poolSapi');

const LOCKED = 'pubkeyhashlocked';

export async function createAndSendRawTransaction(toAddress, amount, keyString, messageOpReturn, unspentList, fee, totalUnspent) {
    let key = smartCash.ECPair.fromWIF(keyString);

    let fromAddress = key.getAddress().toString();

    let transaction = new smartCash.TransactionBuilder();

    let change = totalUnspent - amount - fee;

    if (totalUnspent < amount + fee) {
        return {
            status: 400,
            value: 'The amount exceeds your balance!',
        };
    }

    if (amount < 0.001) {
        return {
            status: 400,
            value: 'The amount is smaller than the minimum accepted. Minimum amount: 0.001.',
        };
    }

    transaction.setLockTime(unspentList.blockHeight);

    //SEND TO
    transaction.addOutput(toAddress, parseFloat(smartCash.amount(amount.toString()).toString()));

    //OP RETURN
    const dataScript = smartCash.script.compile([
        smartCash.opcodes.OP_RETURN,
        Buffer.from(messageOpReturn ? messageOpReturn : 'Sent from SmartHub.'),
    ]);
    transaction.addOutput(dataScript, 0);

    if (change >= fee) {
        //Change TO
        transaction.addOutput(fromAddress, parseFloat(smartCash.amount(change.toString()).toString()));
    } else {
        fee = change;
    }

    //Add unspent and sign them all
    if (!_.isUndefined(unspentList.utxos) && unspentList.utxos.length > 0) {
        unspentList.utxos.forEach((element) => {
            transaction.addInput(element.txid, element.index);
        });

        for (let i = 0; i < unspentList.utxos.length; i += 1) {
            transaction.sign(i, key);
        }
    }

    try {
        let signedTransaction = transaction.build().toHex();

        let tx = await sendTransaction(signedTransaction);

        return {
            status: 200,
            value: tx.txid,
        };
    } catch (err) {
        console.error(err);
    }
}

export function getAddress(privateKey) {
    let key = smartCash.ECPair.fromWIF(privateKey);

    return key.getAddress().toString();
}

export function createNewWalletKeyPair() {
    let keyPair = smartCash.ECPair.makeRandom();
    let address = keyPair.getAddress();
    let key = keyPair.toWIF();
    return {
        privateKey: key,
        address: address,
    };
}

export async function getBalance(_address) {
    try {
        return await request.get(`${getSapiUrl()}/v1/address/balance/${_address}`, {
            json: true,
        });
    } catch (err) {
        console.error(err);
    }
}

export async function getTxId(_txId) {
    try {
        return await request.get(`${getSapiUrl()}/v1/transaction/check/${_txId}`, {
            json: true,
        });
    } catch (err) {
        console.error(err);
    }
}

export async function getRewards(_address) {
    try {
        return await request.get(`${getSapiUrl()}/v1/smartrewards/check/${_address}`, {
            json: true,
        });
    } catch (err) {
        console.error(err);
    }
}

export const UXTO_TYPE = {
    SPENDABLE: 1,
    LOCKED: 0,
    ALL: -1,
};

export async function getUnspent(_address, uxtoType = UXTO_TYPE.ALL, updateLocalUnspent = false) {
    let utxos = {};

    let options = {
        method: 'POST',
        uri: `${getSapiUrl()}/v1/address/unspent`,
        body: {
            address: _address,
            pageNumber: 1,
            pageSize: 500,
            ascending: false,
        },
        json: true,
    };

    try {
        utxos = await request.post(options);

        if (uxtoType === UXTO_TYPE.SPENDABLE) {
            utxos = utxos.utxos.filter((utxo) => utxo.spendable === UXTO_TYPE.SPENDABLE);
        } else if (uxtoType === UXTO_TYPE.LOCKED) {
            utxos = utxos.utxos.filter((utxo) => utxo.spendable === UXTO_TYPE.LOCKED);
        }
    } catch (err) {
        utxos = {};
    }
    return utxos;
}

export async function getSpendableInputs(address) {
    return await getUnspent(address, UXTO_TYPE.SPENDABLE);
}

export async function getLockedInputs(address) {
    return await getUnspent(address, UXTO_TYPE.LOCKED);
}

export async function getSpendableBalance(address) {
    const unspentList = await getUnspent(address, UXTO_TYPE.SPENDABLE);
    const balance = Number(sumFloats(unspentList.utxos.map((utxo) => utxo.value)).toFixed(8));
    return Number(balance.toFixed(8));
}

export async function getLockedBalance(address) {
    const unspentList = await getUnspent(address, UXTO_TYPE.LOCKED);
    const balance = Number(sumFloats(unspentList.utxos.map((utxo) => utxo.value)).toFixed(8));
    return Number(balance.toFixed(8));
}

export async function getTransactionHistory(address) {
    try {
        var options = {
            method: 'POST',
            uri: `https://sapi.smartcash.cc/v1/address/transactions`,
            body: {
                address,
                pageNumber: 1,
                pageSize: 5,
            },
            json: true, // Automatically stringifies the body to JSON
        };
        return await request.post(options).then((res) => res.data);
    } catch (err) {
        console.error(err);
    }
}

export function isLockedTransaction(tx, address) {
    try {
        return (
            tx &&
            tx?.vout &&
            tx?.vout?.find(
                (f) =>
                    f?.scriptPubKey &&
                    f?.scriptPubKey?.addresses &&
                    f?.scriptPubKey?.addresses?.includes(address) &&
                    f.scriptPubKey.type &&
                    f.scriptPubKey.type === LOCKED
            )
        );
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function sendTransaction(hex) {
    var options = {
        method: 'POST',
        uri: `${getSapiUrl()}/v1/transaction/send`,
        body: {
            data: `${hex}`,
            instantpay: false,
            overrideFees: false,
        },
        json: true, // Automatically stringifies the body to JSON
    };

    try {
        return await request.post(options);
    } catch (err) {
        console.error(err);
    }
}

export async function calculateFee(listUnspent, messageOpReturn) {
    let MIN_FEE = 0.001;

    if (_.isUndefined(listUnspent)) return MIN_FEE;

    let countUnspent = listUnspent.length;

    let newFee = (0.001 * (countUnspent * 148 + 2 * 34 + 10 + 9 + (messageOpReturn ? messageOpReturn.length : 0))) / 1024;

    if (newFee > MIN_FEE) MIN_FEE = newFee;

    return roundUp(MIN_FEE, 5);
}

function roundUp(num, precision) {
    precision = Math.pow(10, precision);
    return Math.ceil(num * precision) / precision;
}

export function getSmartRewardsRoi() {
    let options = {
        method: 'GET',
        uri: `https://sapi.smartcash.cc/v1/smartrewards/roi`,
        json: true,
    };
    return request.get(options);
}

export function getSmartNodeRoi() {
    let options = {
        method: 'GET',
        uri: `https://sapi.smartcash.cc/v1/smartnode/roi`,
        json: true,
    };
    return request.get(options);
}
