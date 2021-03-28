import React from 'react';

const ChatStateContext = React.createContext();
const ChatDispatchContext = React.createContext();

const initialValue = {
    history: [],
    error: '',
    loading: false,
    initialLoading: false,
    currentChatAddress: undefined,
    newChat: false,
    messageToSend: '',
    password: '',
    TXID: '',
    passwordNewChat: '',
    addressNewChatToSend: '',
    passwordAcceptChat: '',
};

const ACTION_TYPE = {
    history: 'history',
    error: 'error',
    loading: 'loading',
    initialLoading: 'initialLoading',
    currentChatAddress: 'currentChatAddress',
    newChat: 'newChat',
    messageToSend: 'messageToSend',
    clearState: 'clearState',
    clearTXID: 'clearTXID',
    password: 'password',
    passwordNewChat: 'passwordNewChat',
    addressNewChatToSend: 'addressNewChatToSend',
    passwordAcceptChat: 'passwordAcceptChat',
};

function reducer(state, action) {
    const { type, payload } = action;
    switch (type) {
        case ACTION_TYPE.history: {
            return { ...state, history: payload };
        }
        case ACTION_TYPE.error: {
            return { ...state, error: payload };
        }
        case ACTION_TYPE.success: {
            return { ...state, TXID: payload };
        }
        case ACTION_TYPE.loading: {
            return { ...state, loading: payload };
        }
        case ACTION_TYPE.initialLoading: {
            return { ...state, initialLoading: payload };
        }
        case ACTION_TYPE.currentChatAddress: {
            return { ...state, currentChatAddress: payload };
        }
        case ACTION_TYPE.newChat: {
            return { ...state, newChat: payload };
        }
        case ACTION_TYPE.messageToSend: {
            return { ...state, messageToSend: payload };
        }
        case ACTION_TYPE.password: {
            return { ...state, password: payload };
        }
        case ACTION_TYPE.clearState: {
            return initialValue;
        }
        case ACTION_TYPE.clearTXID: {
            return { ...state, TXID: payload };
        }
        case ACTION_TYPE.addressNewChatToSend: {
            return { ...state, addressNewChatToSend: payload };
        }
        case ACTION_TYPE.passwordNewChat: {
            return { ...state, passwordNewChat: payload };
        }
        case ACTION_TYPE.passwordAcceptChat: {
            return { ...state, passwordAcceptChat: payload };
        }
        default: {
            throw new Error(`Unhandled action type: ${type}`);
        }
    }
}

function ChatProvider({ children }) {
    const [state, dispatch] = React.useReducer(reducer, initialValue);
    return (
        <ChatStateContext.Provider value={state}>
            <ChatDispatchContext.Provider value={dispatch}>{children}</ChatDispatchContext.Provider>
        </ChatStateContext.Provider>
    );
}

function useChatState() {
    const context = React.useContext(ChatStateContext);
    if (context === undefined) {
        throw new Error('useChatState must be used within a ChatProvider');
    }
    return context;
}

function useChatDispatch() {
    const context = React.useContext(ChatDispatchContext);
    if (context === undefined) {
        throw new Error('useChatDispatch must be used within a ChatProvider');
    }
    return context;
}

export { ChatProvider, useChatState, useChatDispatch, ACTION_TYPE };
