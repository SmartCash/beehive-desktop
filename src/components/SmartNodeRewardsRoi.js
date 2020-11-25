import React, { useEffect, useState } from 'react';
import { getSmartRewardsRoi, getSmartNodeRoi } from '../lib/smart';
import style from './SmartNodeRewardsRoi.module.css';

export default function SmartNodeRewardsRoi() {
    const [nodeRoi, setNodeRoi] = useState();
    const [rewardsRoi, setRewardsRoi] = useState();

    useEffect(() => {
        const getROIs = async () => {
            setNodeRoi(await getSmartNodeRoi());
            setRewardsRoi(await getSmartRewardsRoi());
        };
        getROIs();
    }, []);

    if (rewardsRoi && nodeRoi) {
        return (
            <div className={style['wrapper']}>
                <div className={style['wrapperColumn']}>
                    <h2>SmartRewards</h2>
                    <p>
                        SmartRewards (1k+){' '}
                        <span className={style['text-primary']}>
                            {rewardsRoi['SmartRewards Yearly Yield % with 4 Week Bonus']}%
                        </span>
                    </p>
                    <p>
                        SuperRewards (1kk+){' '}
                        <span className={style['text-primary']}>
                            {rewardsRoi['SuperRewards Yearly Yield % with 4 week Bonux']}%
                        </span>
                    </p>
                </div>
                <div className={style['wrapperColumn']}>
                    <h2>SmartNodes</h2>
                    <p>
                        SmartNode Collateral <span className={style['text-primary']}>{nodeRoi['SmartNode Collateral']}</span>
                    </p>
                    <p>
                        Yearly Rewards <span className={style['text-primary']}>{nodeRoi['Yearly Rewards']}</span>
                    </p>
                    <p>
                        Yearly Yield <span className={style['text-primary']}>{nodeRoi['Yearly Yield %']}%</span>
                    </p>
                </div>
            </div>
        );
    }

    return '';
}
