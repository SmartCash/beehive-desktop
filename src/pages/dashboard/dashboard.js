import React, { useContext } from 'react';
import Page from '../../components/Page';
import { DashboardContext, DashboardProvider } from './dashboardContext';
import './dashboard.css';

function DashboardComponent() {
    const { smartRewardsRoi } = useContext(DashboardContext);
    return (
        <Page className="page-dashboard">
            <table>
                <thead>
                    <tr>
                        <th colSpan={2}>SmartRewards ROI</th>
                    </tr>
                </thead>
                <tbody>
                {
                    smartRewardsRoi?.map(roi => {
                        return (
                            <tr key={roi.label}>
                                <td>{roi.label}</td>
                                <td>{roi.value} %</td>
                            </tr>
                        );
                    })
                }
                </tbody>
            </table>
        </Page>
    )
}

function Dashboard() {
    return (
        <DashboardProvider>
            <DashboardComponent/>
        </DashboardProvider>
    )
}

export default Dashboard;
