import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import { stopReportingRuntimeErrors } from 'react-error-overlay';

// Styles
// import './presentation/styles/index.scss';
import './presentation/styles/index.css';

if (process.env.NODE_ENV === 'development') {
    stopReportingRuntimeErrors();
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
