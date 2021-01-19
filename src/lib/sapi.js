import { sumFloats } from './math';

const smartCash = require('smartcashjs-lib');
const request = require('request-promise');
const _ = require('lodash');
let getSapiUrl = require('./poolSapi');

const LOCKED = 'pubkeyhashlocked';
const OP_RETURN_DEFAULT = 'Sent from SmartHub.';

export async function createAndSendRawTransaction({
    toAddress,
    amount,
    privateKey,
    messageOpReturn,
    unspentList,
    fee,
    unlockedBalance,
}) {
    if (!toAddress) {
        return {
            status: 400,
            value: 'You must provide the destination address.',
        };
    }

    if (!amount) {
        return {
            status: 400,
            value: 'You must provide the amount.',
        };
    }

    if (!privateKey) {
        return {
            status: 400,
            value: 'You must provide the private key to sign the raw transaction.',
        };
    }

    if (!unspentList) {
        return {
            status: 400,
            value: 'You must provide the unspent list.',
        };
    }

    if (!unspentList.utxos) {
        return {
            status: 400,
            value: 'You must provide the UTXOs unspent list.',
        };
    }

    if (!fee) {
        return {
            status: 400,
            value: 'You must provide the calculated fee.',
        };
    }

    if (!unlockedBalance) {
        return {
            status: 400,
            value: 'You must provide the unlocked balance.',
        };
    }

    if (unlockedBalance < amount + fee) {
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

    let key = smartCash.ECPair.fromWIF(privateKey);

    let fromAddress = key.getAddress().toString();

    let transaction = new smartCash.TransactionBuilder();

    let change = unlockedBalance - amount - fee;

    transaction.setLockTime(unspentList.blockHeight);
    
    //SEND TO
    transaction.addOutput(toAddress, parseFloat(smartCash.amount(amount.toString()).toString()));

    //OP RETURN
    const dataScript = smartCash.script.compile([
        smartCash.opcodes.OP_RETURN,
        Buffer.from(messageOpReturn ? messageOpReturn : OP_RETURN_DEFAULT),
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

        console.log(signedTransaction);

        let tx = await sendTransaction(signedTransaction);

        console.log(tx);

        return {
            status: 200,
            value: tx.txid,
        };
    } catch (err) {
        return {
            status: 400,
            value: err.message,
        };
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
    let inputs = {};

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
        inputs = await request.post(options);
        if (uxtoType === UXTO_TYPE.SPENDABLE) {
            inputs.utxos = inputs.utxos.filter((input) => input.spendable === UXTO_TYPE.SPENDABLE);
        } else if (uxtoType === UXTO_TYPE.LOCKED) {
            inputs.utxos = inputs.utxos.filter((input) => input.spendable === UXTO_TYPE.LOCKED);
        }
    } catch (err) {
        inputs = {};
    }
    return inputs;
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
    let MIN_FEE = 0.002;

    if (_.isUndefined(listUnspent)) return MIN_FEE;
    console.log(listUnspent);
    let countUnspent = listUnspent.length;
    console.log(countUnspent);

    let newFee =
        (0.001 * (countUnspent * 148 + 2 * 34 + 10 + 9 + (messageOpReturn ? messageOpReturn.length : OP_RETURN_DEFAULT.length))) /
        1024;

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
