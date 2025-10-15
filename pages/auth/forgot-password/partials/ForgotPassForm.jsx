import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod schema for form validation
const forgotPasswordSchema = z.object({
    phone: z
        .string()
        .min(1, 'Vui lòng nhập số điện thoại')
        .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
        .min(10, 'Số điện thoại phải có ít nhất 10 số'),
    companyCode: z
        .string()
        .min(1, 'Vui lòng nhập mã công ty')
        .min(3, 'Mã công ty phải có ít nhất 3 ký tự')
        .max(20, 'Mã công ty không được vượt quá 20 ký tự')
        .regex(/^[A-Za-z0-9]+$/, 'Mã công ty chỉ được chứa chữ cái và số'),
});

/**
 * @typedef {Object} ForgotPassFormProps
 * @property {Function} [onSubmit] - Form submission handler
 * @param {Object} onSubmit.data - Form data
 * @param {string} onSubmit.data.phone - Phone number
 * @param {string} onSubmit.data.companyCode - Company code
 */

/**
 * Forgot Password Form component
 * @description Form for entering phone number to initiate password reset
 * @param {ForgotPassFormProps} props - Component props
 * @returns {JSX.Element} Rendered forgot password form
 * @example
 * // Basic usage
 * <ForgotPassForm onSubmit={handleSubmit} />
 *
 * // Without submit handler
 * <ForgotPassForm />
 */
const ForgotPassForm = ({ onSubmit: onSubmitProp }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async data => {
        if (typeof onSubmitProp === 'function') {
            await onSubmitProp(data);
            return;
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8 mt-20'>
                {/* [Form Fields] */}
                <input
                    type='text'
                    placeholder='Nhập số điện thoại'
                    {...register('phone')}
                    className={`${errors.phone ? 'border-red-500 border' : 'border-[#cccccc]'} border outline-none focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-3 rounded-md w-full`}
                />

                {/* [Mã công ty] */}
                <input
                    type='text'
                    placeholder='Mã công ty'
                    {...register('companyCode')}
                    className={`${errors.companyCode ? 'border-red-500 border' : 'border-[#cccccc]'} border outline-none focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-3 rounded-md w-full`}
                />

                {/* [Form Validation] */}
                {errors.phone && <span className='text-xs text-red-500'>{errors.phone.message}</span>}
                {errors.companyCode && <span className='text-xs text-red-500'>{errors.companyCode.message}</span>}

                {/* [Form Actions] */}
                <button type='submit' className='text-[#FFFFFF] font-normal text-lg py-3 w-full rounded-md bg-gradient-to-l from-[#0375f3]  via-[#296dc1] to-[#0375f3] btn-animation hover:scale-105'>
                    Tiếp theo
                </button>
            </form>
        </>
    );
};

export default ForgotPassForm;
