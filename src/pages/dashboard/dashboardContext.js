import React, { createContext, useEffect, useReducer } from 'react';
import { getSmartRewardsRoi } from '../../lib/smart';

const dashboardReducer = (state, action) => {
    switch (action.type) {
        case 'setSmartRewardsRoi': {
            return {...state, smartRewardsRoi: action.payload }
        }
        default: {
            return state
        }
    }
}

export const DashboardContext = createContext({});

export const DashboardProvider = ({ children }) => {
    const [state, dispatch] = useReducer(dashboardReducer, {});

    useEffect(() => {
        getSmartRewardsRoi().then(data => {
            const smartRewardsRoi = [];
            for (let k in data) {
                smartRewardsRoi.push({
                    label: k,
                    value: data[k]
                });
            }
            dispatch({ type: 'setSmartRewardsRoi', payload: smartRewardsRoi });
        });
    }, [])

    const providerValue = {
        ...state
    };

    return <DashboardContext.Provider value={providerValue}>{children}</DashboardContext.Provider>;
};
