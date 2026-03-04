import ForgotPassForm from './ForgotPassForm';

/**
 * Forgot Password component
 * @description Initial step of forgot password flow with phone number input
 * @returns {JSX.Element} Rendered forgot password step
 * @example
 * // Basic usage
 * <ForgotPass />
 */
const ForgotPass = () => {
    const onSubmit = async data => {
        // integrate send OTP here if needed
    };

    return (
        <>
            {/* ========= FORGOT PASSWORD HEADER ========= */}
            <div className='pt-8'>
                <h1 className='text-[#11315B] font-medium text-3xl text-center capitalize'>Quên Mật Khẩu</h1>
            </div>

            {/* === Forgot Password Form === */}
            <ForgotPassForm onSubmit={onSubmit} />
        </>
    );
};

export default ForgotPass;
