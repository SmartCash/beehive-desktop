import React from 'react';
import ReactDOM from 'react-dom';
import { Startup } from 'application/startup';

// Styles
// import 'presentation/styles/index.scss';
import 'presentation/styles/index.css';

ReactDOM.render(
    <React.StrictMode>
        <Startup />
    </React.StrictMode>,
    document.getElementById('root')
);
