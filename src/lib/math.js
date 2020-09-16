const SATOSHI = 10000000;
const toSatoshi = (amount) => (amount * SATOSHI);
const fromSatoshi = (amount) => (amount / SATOSHI);

export const subtractFloats = (amount1, amount2) => {
    return fromSatoshi(toSatoshi(amount1) - toSatoshi(amount2));
};
