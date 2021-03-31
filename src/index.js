import React from 'react';
import ReactDOM from 'react-dom';
import { Startup } from 'application/startup';
import { stopReportingRuntimeErrors } from 'react-error-overlay';

// Styles
import 'presentation/styles/index.css';

if (process.env.NODE_ENV === 'development') {
    stopReportingRuntimeErrors();
}

ReactDOM.render(
    <React.StrictMode>
        <Startup />
    </React.StrictMode>,
    document.getElementById('root')
);
