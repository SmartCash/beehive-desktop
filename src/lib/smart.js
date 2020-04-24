const smartCash = require("smartcashjs-lib");

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
