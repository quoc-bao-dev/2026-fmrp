import React, { useEffect, useState } from 'react';
import ResetPassForm from './ResetPassForm';
import { useRouter } from 'next/router';

/**
 * Reset Password component
 * @description Final step of forgot password flow for setting new password
 * @returns {JSX.Element} Rendered reset password step
 * @example
 * // Basic usage - company info passed via URL query
 * <ResetPass />
 */
const ResetPass = () => {
    const router = useRouter();
    const [companyCode, setCompanyCode] = useState('');
    const [companyName, setCompanyName] = useState('');

    const onSubmit = async ({ newPassword, confirmPassword, remember }) => {
        // call reset password API here if needed
    };

    useEffect(() => {
        try {
            const code = sessionStorage.getItem('company_code') || (router.query.companyCode ? String(router.query.companyCode) : '');
            const name = sessionStorage.getItem('company_name') || (router.query.companyName ? String(router.query.companyName) : '');
            setCompanyCode(code);
            setCompanyName(name);
        } catch (e) {
            // ignore
        }
    }, [router.query.companyCode, router.query.companyName]);
    return <ResetPassForm companyCode={companyCode} companyName={companyName} onSubmit={onSubmit} />;
};

export default ResetPass;
