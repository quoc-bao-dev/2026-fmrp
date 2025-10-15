import { Eye as IconEye, EyeSlash as IconEyeSlash } from 'iconsax-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

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
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const newPassword = watch('newPassword');

    const handleSubmitForm = async data => {
        if (typeof onSubmit === 'function') {
            await onSubmit({
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
                remember: !!data.remember,
            });
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
                <div className='relative'>
                    <input
                        type={showNew ? 'text' : 'password'}
                        placeholder='Nhập mật khẩu mới'
                        {...register('newPassword', {
                            required: 'Vui lòng nhập mật khẩu mới',
                            minLength: { value: 6, message: 'Tối thiểu 6 ký tự' },
                        })}
                        className={`${
                            errors.newPassword ? 'border-red-500 border' : 'border-[#cccccc]'
                        } border outline-none focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-3 pr-12 rounded-md w-full`}
                    />
                    <button type='button' onClick={() => setShowNew(!showNew)} className='absolute top-1/2 -translate-y-1/2 right-3'>
                        {showNew ? <IconEyeSlash /> : <IconEye />}
                    </button>
                    {errors.newPassword && <span className='text-xs text-red-500 mt-1 inline-block'>{errors.newPassword.message}</span>}
                </div>

                <div className='relative'>
                    <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder='Nhập lại mật khẩu'
                        {...register('confirmPassword', {
                            required: 'Vui lòng nhập lại mật khẩu',
                            validate: v => v === newPassword || 'Mật khẩu không khớp',
                        })}
                        className={`${
                            errors.confirmPassword ? 'border-red-500 border' : 'border-[#cccccc]'
                        } border outline-none focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-3 pr-12 rounded-md w-full`}
                    />
                    <button type='button' onClick={() => setShowConfirm(!showConfirm)} className='absolute top-1/2 -translate-y-1/2 right-3'>
                        {showConfirm ? <IconEyeSlash /> : <IconEye />}
                    </button>
                    {errors.confirmPassword && <span className='text-xs text-red-500 mt-1 inline-block'>{errors.confirmPassword.message}</span>}
                </div>
            </div>

            <label className='flex items-center space-x-2 select-none'>
                <input type='checkbox' {...register('remember')} />
                <span>Ghi nhớ cho lần đăng nhập sau</span>
            </label>

            <button type='submit' className='text-[#FFFFFF] font-normal text-lg py-3 w-full rounded-md bg-gradient-to-l from-[#0375f3]  via-[#296dc1] to-[#0375f3] btn-animation hover:scale-105'>
                Xác nhận
            </button>
        </form>
    );
};

export default ResetPassForm;
