import React, { useContext, useEffect, useState } from 'react';
import { WalletContext } from '../context/WalletContext';

const random = require('random');

let sapis = [
    'http://207.180.228.119:8080',
    'http://90.145.247.163:8080',
    'http://62.171.171.66:8080',
    'http://167.86.91.147:8080',
    'http://185.216.231.73:8080',
    'http://167.86.89.56:8080',
    'http://207.180.200.240:8080',
    'http://207.180.211.105:8080',
    'http://167.86.88.138:8080',
];


export function GetSapiUrl(){    
    let sapiAddress = `https://sapi.smartcash.cc`;

    if (window.location.protocol === 'http:') {
        sapiAddress = sapis[random.int(0, sapis.length - 1)];
    }
    
    return sapiAddress;
}
