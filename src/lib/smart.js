const smartCash = require('smartcashjs-lib');
const request = require('request-promise');

export function isAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            smartCash.address.fromBase58Check(address);
            resolve(address);
        } catch (e) {
            return reject(e);
        }
    });
}

export function isPK(keyString) {
    return new Promise((resolve, reject) => {
        try {
            smartCash.ECPair.fromWIF(keyString);
            resolve(keyString);
        } catch (e) {
            return reject(e);
        }
    });
}

export function getSupportedCurrencies() {
    let options = {
        method: 'GET',
        uri: `https://api.coingecko.com/api/v3/simple/supported_vs_currencies`,
        json: true,
    };
    return request.get(options);
}

export function getCurrenciePrice(vs_currencies = 'usd,btc') {
    let options = {
        method: 'GET',
        uri: `https://api.coingecko.com/api/v3/simple/price?ids=smartcash&vs_currencies=${vs_currencies}`,
        json: true,
    };
    return request.get(options);
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
