import { partners } from './partners';
import React, { useEffect, useState } from 'react';

const electron = window.require('electron');

export function RandomPartners() {
    const randomPartner = () => Math.floor(Math.random() * partners.length);
    const [partner, setPartner] = useState(partners[randomPartner()]);

    useEffect(() => {
        setInterval(() => setPartner(partners[randomPartner()]), 5000);
    }, []);

    return (
        <>
            <button type="button" className="btn" onClick={() => electron.shell.openExternal(partner.url)}>
                <img src={partner.image} alt={partner.name} width="180" />
            </button>
        </>
    );
}
