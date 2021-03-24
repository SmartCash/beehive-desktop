const { mnemonic } = require('smartcashjs-lib/src/index');
const TEST_PHRASE = 'grape front option already anxiety mixed public bulb final expose chef traffic';

// console.log(mnemonic.generatePhrase());
// console.log(mnemonic.validatePhrase({ words: TEST_PHRASE }));
console.log(JSON.stringify(mnemonic.getFromDerivationPaths({ words: TEST_PHRASE })));
