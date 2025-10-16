import { useEffect, useState } from 'react';
import OtpVerifyForm from './OtpVerifyForm';

/**
 * OTP Verification component
 * @description Second step of forgot password flow for OTP verification
 * @returns {JSX.Element} Rendered OTP verification step
 * @example
 * // Basic usage - phone number passed via URL query
 * <Otp />
 */
const Otp = () => {
    const [phone, setPhone] = useState('');

    useEffect(() => {
        try {
            const savedPhone = typeof window !== 'undefined' ? sessionStorage.getItem('forgot_phone') : '';
            setPhone(savedPhone || '');
        } catch (e) {
            setPhone('');
        }
    }, []);

    const onSubmit = async code => {};

    return <OtpVerifyForm phone={phone} length={6} onSubmit={onSubmit} />;
};

export default Otp;
