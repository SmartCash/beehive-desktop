import React from 'react';
import ReactDOM from 'react-dom';
import style from './modal.module.css';

export function Modal(props) {
    return ReactDOM.createPortal(<ModalContent {...props} />, document.getElementById('root'));
}

function ModalContent(props) {
    return (
        <>
            <div className={style['modal-overlay']} />
            <div className={style['modal-wrapper']} aria-modal aria-hidden tabIndex={-1} role="dialog">
                <div className={style['modal']}>
                    <div className={style['modal-header']}>
                        <h2 className={style['modal-title']}>{props.title}</h2>
                        {!props.showCloseButton && (
                            <button
                                type="button"
                                className={style['modal-close-button']}
                                data-dismiss="modal"
                                aria-label="Close"
                                onClick={props.onClose}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        )}
                    </div>
                    <div className={style['modal-body']}>
                        {props.children}
                    </div>
                </div>
            </div>
        </>
    );
}
