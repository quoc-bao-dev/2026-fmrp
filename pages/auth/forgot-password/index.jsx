import React from 'react';
import ForgotPassPage from './partials/ForgotPassPage';
import { ForgotPasswordProvider } from './partials/ForgotPasswordContext';

const Page = () => {
    return (
        <ForgotPasswordProvider>
            <ForgotPassPage />
        </ForgotPasswordProvider>
    );
};

export default Page;
