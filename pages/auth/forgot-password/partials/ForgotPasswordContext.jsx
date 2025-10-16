import React, { createContext, useContext, useState } from 'react';

/**
 * Forgot Password Context
 * @description Global state management for forgot password flow steps
 */

const ForgotPasswordContext = createContext();

/**
 * Forgot Password Provider component
 * @description Provides forgot password step state and navigation functions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider
 * @example
 * // Wrap the forgot password page with provider
 * <ForgotPasswordProvider>
 *   <ForgotPassPage />
 * </ForgotPasswordProvider>
 */
export const ForgotPasswordProvider = ({ children }) => {
    const [step, setStep] = useState('forgot');

    /**
     * Navigate to forgot password step
     * @description Sets step to 'forgot' (initial step)
     */
    const goToForgot = () => {
        setStep('forgot');
    };

    /**
     * Navigate to OTP verification step
     * @description Sets step to 'otp'
     */
    const goToOtp = () => {
        setStep('otp');
    };

    /**
     * Navigate to reset password step
     * @description Sets step to 'reset'
     */
    const goToReset = () => {
        setStep('reset');
    };

    /**
     * Navigate to login page
     * @description Sets step to 'login' (final step)
     */
    const goToLogin = () => {
        setStep('login');
    };

    const value = {
        step,
        setStep,
        goToForgot,
        goToOtp,
        goToReset,
        goToLogin,
    };

    return <ForgotPasswordContext.Provider value={value}>{children}</ForgotPasswordContext.Provider>;
};

/**
 * Custom hook to use forgot password context
 * @description Returns forgot password state and navigation functions
 * @returns {Object} Context value with step state and navigation functions
 * @throws {Error} When used outside of ForgotPasswordProvider
 * @example
 * // Use in components
 * const { step, goToOtp, goToReset } = useForgotPassword();
 *
 * // Navigate to next step
 * const handleSuccess = () => {
 *   goToOtp();
 * };
 */
export const useForgotPassword = () => {
    const context = useContext(ForgotPasswordContext);
    if (!context) {
        throw new Error('useForgotPassword must be used within a ForgotPasswordProvider');
    }
    return context;
};

export default ForgotPasswordContext;
