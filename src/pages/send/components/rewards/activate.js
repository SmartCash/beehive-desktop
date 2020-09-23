import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { subtractFloats } from '../../../../lib/math';
import { createAndSendRawTransaction, getBalance, getRewards, getTxId, getUnspent } from '../../../../lib/sapi';
import useModal from '../../../../util/useModal';
import style from './activate.module.css';

function RewardsActivate({ address, privateKey, balance: _balance, rewards: _rewards }) {
    let timer;
    const { isShowing, toggle } = useModal(false);
    const [loading, setLoading] = useState(false);
    const [activating, setActivating] = useState(false);
    const [type, setType] = useState();
    const [rewards, setRewards] = useState(_rewards);
    const [balance, setBalance] = useState(_balance);

    const { register, handleSubmit, errors, setError, setValue, formState } = useForm({
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        const unspents = await getUnspent(address);
        if (unspents.utxos.length === 1) {
            await SendTransaction(data).then((data) => checkTxId(data?.txid));
        } else if (unspents.utxos.length > 1) {
            await SendTransaction(data);
            await SendTransaction(data).then((data) => checkTxId(data?.txid));
        }
    };

    const SendTransaction = (_data) => {
        setLoading(true);
        const amount = Number(subtractFloats(balance, 0.001).toFixed(8));
        return createAndSendRawTransaction(address, amount, String(privateKey || _data?.privateKey)).then(async (data) => {
            await getBalance(address).then((res) => setBalance(res.balance));
            return data;
        });
    };

    const checkTxId = async (_txid) => {
        setActivating(true);
        const txid = await getTxId(_txid);
        if (txid.confirmations >= 1) {
            clearTimeout(timer);
            getRewards(address).then((_data) => {
                setRewards(_data);
                if (_data.activated === 1) {
                    setActivating(false);
                }
            });
            return;
        }
        timer = setTimeout(() => checkTxId(_txid), 55000);
    };

    if (rewards && rewards.activated === 0 && activating) {
        return (
            <div className={style.wrapperActivating}>
                <img
                    src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
                    width="25px"
                    height="25px"
                />
                <p>Activating your Rewards.</p>
                <p>This can take a while, do not reload this page.</p>
            </div>
        );
    }
}

export default RewardsActivate;
