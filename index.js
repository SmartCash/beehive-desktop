const { generatePhrase, getFromDerivationPaths, validatePhrase } = require('./src/lib/smart-mnemonic');
const TEST_PHRASE = 'grape front option already anxiety mixed public bulb final expose chef traffic';

// console.log(generatePhrase());
// console.log(validatePhrase({ words: TEST_PHRASE }));
console.log(JSON.stringify(getFromDerivationPaths({ words: TEST_PHRASE })));
