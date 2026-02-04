import React, { createContext, useContext, useState } from 'react';

const ApplicationInstallContext = createContext(null);

export const ApplicationInstallProvider = ({ children }) => {
    const [featureName, setFeatureName] = useState('');
    const [paymentResult, setPaymentResult] = useState(null);

    return (
        <ApplicationInstallContext.Provider
            value={{
                featureName,
                setFeatureName,
                paymentResult,
                setPaymentResult,
            }}
        >
            {children}
        </ApplicationInstallContext.Provider>
    );
};

export const useApplicationInstall = () => {
    const ctx = useContext(ApplicationInstallContext);
    if (!ctx) {
        throw new Error('useApplicationInstall must be used within ApplicationInstallProvider');
    }
    return ctx;
};

