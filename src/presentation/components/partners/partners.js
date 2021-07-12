import React from 'react';
import { partners } from './partners_vars';
import styles from './partners.module.scss';

const electron = window.require('electron');

export function Partners() {
    return (
        <div className={styles.root}>
            {partners.map((partner) => (
                <button type='button' className='btn' onClick={() => electron.shell.openExternal(partner.url)}>
                    <img src={partner.image} alt={partner.name} width='180' />
                </button>
            ))}
        </div>
    );
}
