import * as CryptoJS from 'crypto-js';

export function encrypt(dataToEncrypt, secret) {
    return CryptoJS.AES.encrypt(dataToEncrypt, secret).toString();
}

export function decrypt(encryptedData, secret) {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(encryptedData, secret));
}
