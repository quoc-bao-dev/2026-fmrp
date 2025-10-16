import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useChangePassword } from '@/managers/api/auth/useChangePassword';
import { useForgotPassword } from './ForgotPasswordContext';
import InputPassword from './InputPassword';

/*
  ResetPassForm
  Optional props:
    - companyCode?: string
    - companyName?: string
    - rememberDefault?: boolean
    - onSubmit?: (payload: { newPassword: string; confirmPassword: string; remember: boolean }) => Promise<void> | void
*/
const ResetPassForm = ({ companyCode = '', companyName = '', rememberDefault = true, onSubmit }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: { remember: rememberDefault },
    });

    const { goToLogin } = useForgotPassword();
    const { changePassword, isLoading } = useChangePassword({
        onSuccess: () => {
            // clear dữ liệu
            sessionStorage.removeItem('company_code');
            sessionStorage.removeItem('company_name');
            sessionStorage.removeItem('forgot_phone');
            sessionStorage.removeItem('key_change_password');
            goToLogin();
        },
    });

    const newPassword = watch('newPassword');

    const handleSubmitForm = async data => {
        // Log dữ liệu: password, company code, key change password, phone (lấy từ session)
        try {
            const companyCode = sessionStorage.getItem('company_code') || '';
            const phone = sessionStorage.getItem('forgot_phone') || '';
            const keyChange = sessionStorage.getItem('key_change_password') || '';

            const previewPayload = {
                phone_number: phone,
                company_code: companyCode,
                key_change_password: keyChange,
                password: data?.newPassword || '',
            };

            console.log('Preview change password payload from session:', previewPayload);

            // Gọi API đổi mật khẩu
            await changePassword(previewPayload);
        } catch (e) {
            console.warn('Cannot access sessionStorage to log payload:', e);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleSubmitForm)} className='space-y-6 mt-10'>
            <div className='text-center'>
                <h1 className='text-[#11315B] font-medium text-3xl capitalize'>Đặt Lại Mật Khẩu</h1>
            </div>

            {(companyCode || companyName) && (
                <div className='grid grid-cols-2 gap-8 pt-12'>
                    <div>
                        <p className='text-[#98A2B3] text-sm'>Mã công ty</p>
                        <p className='text-[#101828]  mt-1 break-all'>{companyCode || '-'}</p>
                    </div>
                    <div>
                        <p className='text-[#98A2B3] text-sm'>Tên công ty</p>
                        <p className='text-[#101828] mt-1 break-all'>{companyName || '-'}</p>
                    </div>
                </div>
            )}

            <div className='space-y-7 pt-6'>
                <InputPassword
                    placeholder='Nhập mật khẩu mới'
                    {...register('newPassword', {
                        required: 'Vui lòng nhập mật khẩu mới',
                        minLength: { value: 6, message: 'Tối thiểu 6 ký tự' },
                    })}
                    error={errors.newPassword}
                />

                <InputPassword
                    placeholder='Nhập lại mật khẩu'
                    {...register('confirmPassword', {
                        required: 'Vui lòng nhập lại mật khẩu',
                        validate: v => v === newPassword || 'Mật khẩu không khớp',
                    })}
                    error={errors.confirmPassword}
                />
            </div>

            <label className='flex items-center space-x-2 select-none'>
                <input type='checkbox' {...register('remember')} />
                <span>Ghi nhớ cho lần đăng nhập sau</span>
            </label>

            <button
                type='submit'
                disabled={isLoading}
                className={`text-[#FFFFFF] font-normal text-lg py-3 w-full rounded-md bg-gradient-to-l from-[#0375f3]  via-[#296dc1] to-[#0375f3] btn-animation hover:scale-105 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
        </form>
    );
};

export default ResetPassForm;
