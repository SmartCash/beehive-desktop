const smartCash = require("smartcashjs-lib");
const request = require("request-promise");
const _ = require("lodash");
let getSapiUrl = require("./poolSapi");

export async function createAndSendRawTransaction(
  toAddress,
  amount,
  keyString
) {
  let key = smartCash.ECPair.fromWIF(keyString);

  let fromAddress = key.getAddress().toString();

  let transaction = new smartCash.TransactionBuilder();

  let sapiUnspent = await getUnspentWithAmount(fromAddress, amount);

  let totalUnspent = _.sumBy(sapiUnspent.utxos, "amount");

  let fee = calculateFee(sapiUnspent.utxos);

  let change = totalUnspent - amount - fee;

  if (totalUnspent < amount + fee)
    throw new Error("The amount exceeds your balance!");

  if (amount < 0.001)
    throw new Error(
      "The amount is smaller than the minimum accepted. Minimum amount: 0.001."
    );

  transaction.setLockTime(sapiUnspent.blockHeight);

  //SEND TO
  transaction.addOutput(
    toAddress,
    parseFloat(smartCash.amount(amount.toString()).toString())
  );

  if (change >= fee) {
    //Change TO
    transaction.addOutput(
      fromAddress,
      parseFloat(smartCash.amount(change.toString()).toString())
    );
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
}

export function getAddress(privateKey) {
  let key = smartCash.ECPair.fromWIF(privateKey);

  return key.getAddress().toString();
}

export function createNewWalletKeyPair(){
    let keyPair = smartCash.ECPair.makeRandom();
    let address = keyPair.getAddress();
    let key = keyPair.toWIF();
    return {
        privateKey: key,
        address: address
    };
}

/*
    This method should be public
    This is used to get the FROM address and the amount
    After it does call private methods to calculate the fee
*/
export async function getFee(amount, fromAddress) {
  let sapiUnspent = await getUnspentWithAmount(fromAddress, amount);

  let fee = calculateFee(sapiUnspent.utxos);

  return fee;
}

export async function getBalance(_address) {
  try {
    return await request.get(`${getSapiUrl()}/v1/address/balance/${_address}`, {
      json: true,
    });
  } catch (err) {
    throw err;
  }
}

export async function getUnspentWithAmount(_address, _amount) {
  let utxos = {};

  let options = {
    method: "POST",
    uri: `${getSapiUrl()}/v1/address/unspent/amount`,
    body: {
      address: _address,
      amount: _amount,
      random: true,
      instantpay: false,
    },
    json: true,
  };

  try {
    utxos = await request.post(options);
  } catch (err) {
    utxos = {};
  }
  return utxos;
}

export async function getUnspent(_address) {
  let utxos = {};

  let options = {
    method: "POST",
    uri: `${getSapiUrl()}/v1/address/unspent`,
    body: {
      address: _address,
      pageNumber: 1,
      pageSize: 10,
      ascending: false,
    },
    json: true,
  };

  try {
    utxos = await request.post(options);
  } catch (err) {
    utxos = {};
  }
  return utxos;
}

export async function getTransactionHistory(_address) {
  try {
    return await request.get(
      `https://insight.smartcash.cc/api/txs/apps/?address=${_address}&limit=5`
    );
  } catch (err) {
    throw err;
  }
}

export async function sendTransaction(hex) {
  var options = {
    method: "POST",
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
    throw err;
  }
}

function calculateFee(listUnspent) {
  let MIN_FEE = 0.001;

  if (_.isUndefined(listUnspent)) return MIN_FEE;

  let countUnspent = listUnspent.length;

  let newFee = (0.001 * (countUnspent * 148 + 2 * 34 + 10 + 9) / 1024);

  if (newFee > MIN_FEE) MIN_FEE = newFee;

  return roundUp(MIN_FEE, 5);
}

function roundUp(num, precision) {
  precision = Math.pow(10, precision);
  return Math.ceil(num * precision) / precision;
}
