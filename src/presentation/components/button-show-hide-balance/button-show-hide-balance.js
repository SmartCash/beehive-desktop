import { WalletContext } from 'application/context/WalletContext';
import React, { useContext, useState } from 'react';
import { ReactComponent as VisibleOnIcon } from 'presentation/assets/images/visibility_on.svg';
import { ReactComponent as VisibleOffIcon } from 'presentation/assets/images/visibility_off.svg';

export function ButtonShowHideBalance() {
    const { hideBalance, setHideBalance } = useContext(WalletContext);    

    function hideShowBalance() {        
        setHideBalance(!hideBalance);
    }

    return (
        <>
            <button className="btnHideShow" title="Show/Hide Balance"  onClick={() => hideShowBalance()}>
                {!hideBalance && (<VisibleOffIcon />)}
                {hideBalance && (<VisibleOnIcon />)}                               
            </button>            
        </>
    );
}
