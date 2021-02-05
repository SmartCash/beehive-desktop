import { sumFloats } from './math';

const smartCash = require('smartcashjs-lib');
const request = require('request-promise');
const _ = require('lodash');
let getSapiUrl = require('./poolSapi');
const crypto = window.require('crypto');

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

    if (!unspentList.utxos.length === 0) {
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
        let tx = await sendTransaction(signedTransaction);

        if (tx.status === 400) {
            return {
                status: 400,
                value: tx.value,
            };
        }

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

export function createRSAKeyPair(password) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: password,
        },
    });
    const RSA = {
        rsaPublicKey: publicKey,
        rsaPrivateKey: privateKey,
    };
    return RSA;
}

// We must encrypt a message with the receiver PUBLIC KEY so when this person receives it
// They can decrypt with their Private Key
export function encryptTextWithReceiverRSAPublicKey(rsaReceiverPublicKey, message) {
    var encMsg = crypto.publicEncrypt(rsaReceiverPublicKey, Buffer.from(message));
    return encMsg.toString('base64');
}

export function decryptTextWithRSAPrivateKey(rsaPrivateKey, passphrase, encryptedMessage) {
    const privateKeyWithPassphrase = {
        key: rsaPrivateKey,
        passphrase: passphrase,
    };
    var decMsg = crypto.privateDecrypt(privateKeyWithPassphrase, Buffer.from(encryptedMessage, 'base64'));
    return decMsg.toString('utf8');
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

export async function getTransactionHistoryGroupedByAddresses(address) {
    try {
        return groupByAddress(await getTransactionHistory(address));
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

export function getOpReturnMessage(tx) {
    try {
        if (tx && tx?.vout) {
            const outWithOpReturn = tx?.vout?.find(
                (f) => f?.scriptPubKey && f?.scriptPubKey?.asm && f?.scriptPubKey?.asm?.includes('OP_RETURN')
            );
            if (outWithOpReturn) {
                const message = outWithOpReturn?.scriptPubKey?.asm?.toString().replace('OP_RETURN ', '');
                if (message) {
                    const convert = (from, to) => (str) => Buffer.from(str, from).toString(to);
                    const hexToUtf8 = convert('hex', 'utf8');
                    const decodedMessage = hexToUtf8(message);
                    return decodedMessage;
                }
            }
        }
        return '';
    } catch (err) {
        console.error(err);
        return '';
    }
}

export function groupByAddress(txs) {
    try {
        let parsedTransactions = txs.map((tx) => getAddressAndMessage(tx)).filter((f) => f !== null);

        var grouped = _(parsedTransactions)
            .groupBy('toAddress')
            .map(function (messages, key) {
                return {
                    chatAddress: key,
                    messages: messages,
                };
            })
            .value();

        console.log(`grouped`, grouped);
        return grouped;
    } catch (err) {
        console.error(err);
        return [];
    }
}

export function getAddressAndMessage(tx) {
    let transaction = {};
    transaction.fromAddress = tx.address;
    transaction.direction = tx.direction;
    transaction.time = tx.time;
    try {
        if (tx && tx?.vout) {
            if (tx.direction === 'Sent') {
                const outAddress = tx?.vout?.find(
                    (f) =>
                        f?.scriptPubKey &&
                        f?.scriptPubKey?.addresses &&
                        f?.scriptPubKey?.addresses.length > 0 &&
                        !f?.scriptPubKey?.addresses?.includes(tx.address)
                );

                if (outAddress) {
                    const address = outAddress?.scriptPubKey?.addresses[0];
                    transaction.toAddress = address;
                }
            } else {
                const input = tx?.vin[0];
                if (input) {
                    const inputAddress = input?.scriptPubKey?.addresses[0];
                    transaction.toAddress = inputAddress;
                }
            }

            const outWithOpReturn = tx?.vout?.find(
                (f) => f?.scriptPubKey && f?.scriptPubKey?.asm && f?.scriptPubKey?.asm?.includes('OP_RETURN')
            );
            if (outWithOpReturn) {
                const message = outWithOpReturn?.scriptPubKey?.asm?.toString().replace('OP_RETURN ', '');
                if (message) {
                    const convert = (from, to) => (str) => Buffer.from(str, from).toString(to);
                    const hexToUtf8 = convert('hex', 'utf8');
                    const decodedMessage = hexToUtf8(message);
                    transaction.message = decodedMessage;
                }
            }
        }
        if (!transaction.toAddress) return null;
    } catch (err) {
        console.error(err);
        return '';
    }
    return transaction;
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
        return {
            status: 400,
            value: err.error[0].message,
        };
    }
}

export async function calculateFee(listUnspent, messageOpReturn) {
    let MIN_FEE = 0.002;

    if (_.isUndefined(listUnspent)) return MIN_FEE;
    let countUnspent = listUnspent.length;

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
