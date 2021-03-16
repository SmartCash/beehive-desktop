const smartcash = require('smartcashjs-lib');
const request = require('request-promise');
const Mnemonic = require('./mnemonic/jsbip39');
const bip38 = require('./mnemonic/bitcoinjs-bip38-2.0.2.js');
const WORDLISTS = require('./wordlist_english');
const mnemonics = { english: new Mnemonic('english') };
const mnemonic = mnemonics['english'];
const seed = null;
const bip32RootKey = null;
const bip32ExtendedKey = null;

const network = {
    messagePrefix: '\x18SmartCash Signed Message:\n',
    bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4,
    },
    pubKeyHash: 0x3f,
    scriptHash: 0x12,
    wif: 0xbf,
};

export function generateRandomWords() {
    // get the amount of entropy to use
    const numWords = parseInt(15);
    const strength = (numWords / 3) * 32;
    const buffer = new Uint8Array(strength / 8);
    // create secure entropy
    const data = crypto.getRandomValues(buffer);
    // show the words
    const words = mnemonic.toMnemonic(data);

    return words;
}

export function isAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            smartcash.address.fromBase58Check(address);
            resolve(address);
        } catch (e) {
            return reject(e);
        }
    });
}

function calcBip32RootKeyFromSeed(phrase, passphrase) {
    seed = mnemonic.toSeed(phrase, passphrase);
    bip32RootKey = smartcash.HDNode.fromSeedHex(seed);
}

function calcBip32RootKeyFromBase58(rootKeyBase58) {
    // try the network params as currently specified
    bip32RootKey = smartcash.HDNode.fromBase58(rootKeyBase58);
}
function calcBip32ExtendedKey(path) {
    // Check there's a root key to derive from
    if (!bip32RootKey) {
        return bip32RootKey;
    }
    var extendedKey = bip32RootKey;
    // Derive the key from the path
    var pathBits = path.split('/');
    for (var i = 0; i < pathBits.length; i++) {
        var bit = pathBits[i];
        var index = parseInt(bit);
        if (isNaN(index)) {
            continue;
        }
        var hardened = bit[bit.length - 1] == "'";
        var isPriv = !extendedKey.isNeutered();
        var invalidDerivationPath = hardened && !isPriv;
        if (invalidDerivationPath) {
            extendedKey = null;
        } else if (hardened) {
            extendedKey = extendedKey.deriveHardened(index);
        } else {
            extendedKey = extendedKey.derive(index);
        }
    }
    return extendedKey;
}
export function findPhraseErrors(phrase) {
    // Preprocess the words
    phrase = mnemonic.normalizeString(phrase);
    var words = phraseToWordArray(phrase);
    // Detect blank phrase
    if (words.length == 0) {
        return 'Blank mnemonic';
    }
    // Check each word
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        var language = getLanguage();
        if (WORDLISTS[language].indexOf(word) == -1) {
            console.log('Finding closest match to ' + word);
            var nearestWord = findNearestWord(word);
            return word + ' not in wordlist, did you mean ' + nearestWord + '?';
        }
    }
    // Check the words are valid
    var properPhrase = wordArrayToPhrase(words);
    var isValid = mnemonic.check(properPhrase);
    if (!isValid) {
        return 'Invalid mnemonic';
    }
    return false;
}
function validateRootKey(rootKeyBase58) {
    // try the network params as currently specified
    try {
        smartcash.HDNode.fromBase58(rootKeyBase58);
    } catch (e) {
        return 'Invalid root key';
    }
    return '';
}
function getLanguage() {
    var defaultLanguage = 'english';
    // Try to get from existing phrase
    var language = getLanguageFromPhrase();
    // Try to get from url if not from phrase
    if (language.length == 0) {
        language = getLanguageFromUrl();
    }
    // Default to English if no other option
    if (language.length == 0) {
        language = defaultLanguage;
    }
    return language;
}
function findNearestWord(word) {
    var language = getLanguage();
    var words = WORDLISTS[language];
    var minDistance = 99;
    var closestWord = words[0];
    for (var i = 0; i < words.length; i++) {
        var comparedTo = words[i];
        if (comparedTo.indexOf(word) == 0) {
            return comparedTo;
        }
        var distance = Levenshtein.get(word, comparedTo);
        if (distance < minDistance) {
            closestWord = comparedTo;
            minDistance = distance;
        }
    }
    return closestWord;
}
function getLanguageFromPhrase(phrase) {
    // Check if how many words from existing phrase match a language.
    var language = '';
    if (!phrase) {
        phrase = DOM.phrase.val();
    }
    if (phrase.length > 0) {
        var words = phraseToWordArray(phrase);
        var languageMatches = {};
        for (l in WORDLISTS) {
            // Track how many words match in this language
            languageMatches[l] = 0;
            for (var i = 0; i < words.length; i++) {
                var wordInLanguage = WORDLISTS[l].indexOf(words[i]) > -1;
                if (wordInLanguage) {
                    languageMatches[l]++;
                }
            }
            // Find languages with most word matches.
            // This is made difficult due to commonalities between Chinese
            // simplified vs traditional.
            var mostMatches = 0;
            var mostMatchedLanguages = [];
            for (var l in languageMatches) {
                var numMatches = languageMatches[l];
                if (numMatches > mostMatches) {
                    mostMatches = numMatches;
                    mostMatchedLanguages = [l];
                } else if (numMatches == mostMatches) {
                    mostMatchedLanguages.push(l);
                }
            }
        }
        if (mostMatchedLanguages.length > 0) {
            // Use first language and warn if multiple detected
            language = mostMatchedLanguages[0];
            if (mostMatchedLanguages.length > 1) {
                console.warn('Multiple possible languages');
                console.warn(mostMatchedLanguages);
            }
        }
    }
    return language;
}
function setMnemonicLanguage() {
    var language = getLanguage();
    // Load the bip39 mnemonic generator for this language if required
    if (!(language in mnemonics)) {
        mnemonics[language] = new Mnemonic(language);
    }
    mnemonic = mnemonics[language];
}
function phraseToWordArray(phrase) {
    var words = phrase.split(/\s/g);
    var noBlanks = [];
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        if (word.length > 0) {
            noBlanks.push(word);
        }
    }
    return noBlanks;
}
function wordArrayToPhrase(words) {
    var phrase = words.join(' ');
    var language = getLanguageFromPhrase(phrase);
    if (language == 'japanese') {
        phrase = words.join('\u3000');
    }
    return phrase;
}
function uint8ArrayToHex(a) {
    var s = '';
    for (var i = 0; i < a.length; i++) {
        var h = a[i].toString(16);
        while (h.length < 2) {
            h = '0' + h;
        }
        s = s + h;
    }
    return s;
}

function getDerivationPath() {
    if (bip44TabSelected()) {
        var purpose = parseIntNoNaN(DOM.bip44purpose.val(), 44);
        var coin = parseIntNoNaN(224);
        var account = parseIntNoNaN(DOM.bip44account.val(), 0);
        var change = parseIntNoNaN(DOM.bip44change.val(), 0);
        var path = 'm/';
        path += purpose + "'/";
        path += coin + "'/";
        path += account + "'/";
        path += change;
        DOM.bip44path.val(path);
        var derivationPath = DOM.bip44path.val();
        console.log('Using derivation path from BIP44 tab: ' + derivationPath);
        return derivationPath;
    } else if (bip32TabSelected()) {
        var derivationPath = DOM.bip32path.val();
        console.log('Using derivation path from BIP32 tab: ' + derivationPath);
        return derivationPath;
    } else {
        console.log('Unknown derivation path');
    }
}
function parseIntNoNaN(val, defaultVal) {
    var v = parseInt(val);
    if (isNaN(v)) {
        return defaultVal;
    }
    return v;
}
export function isPK(keyString) {
    return new Promise((resolve, reject) => {
        try {
            smartcash.ECPair.fromWIF(keyString);
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
