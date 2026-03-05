'use client';

import apiLogin from '@/Api/apiLogin/apiLogin';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import LoadingButton from '@/components/UI/loading/loadingButton';
import { optionsQuery } from '@/configs/optionsQuery';
import { IMAGES } from '@/constants/images';
import { useSetings } from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import { CookieCore } from '@/utils/lib/cookie';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Eye as IconEye, EyeSlash as IconEyeSlash } from 'iconsax-react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Script from 'next/script';
import React, { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import 'sweetalert2/src/sweetalert2.scss';
import QuickSupportButton from '../login/QuickSupportButton';

const formatPhone = phone => {
  // Xoá hết dấu cách và ký tự không phải số
  const digits = phone.replace(/\D/g, '');

  // Nếu đủ 10 số thì format thành "XXXX XXX XXX"
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  // Nếu đủ 11 số thì format thành "XXXX XXX XXXX"
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  // Ngược lại trả về nguyên bản
  return phone;
};

const RocketCharacter = React.memo(({ message, stepRegister, totalSteps }) => {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [canStartTyping, setCanStartTyping] = useState(false);

  // Reset khi stepRegister thay đổi
  useEffect(() => {
    if (!message) return;
    setDisplayedMessage('');
    setCanStartTyping(false);
  }, [stepRegister, message]);

  // Bắt đầu typing khi animation di chuyển hoàn thành
  useEffect(() => {
    if (!canStartTyping || !message) return;

    setDisplayedMessage('');

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedMessage(message.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 70); // Tốc độ typing: 80ms mỗi ký tự

    return () => clearInterval(typingInterval);
  }, [canStartTyping, message]);

  return (
    <motion.div
      className='absolute flex flex-col items-center h-[100px] w-[100px] 2xl:h-[125px] 2xl:w-[125px] '
      style={{ bottom: 0 }}
      initial={{ left: `${(0.5 / totalSteps) * 100}%`, translateX: '-50%', opacity: 0, scale: 0.8 }}
      animate={{ left: `${((stepRegister + 0.5) / totalSteps) * 100}%`, translateX: '-50%', opacity: 1, scale: 1 }}
      transition={{
        left: { duration: 1, ease: [0.2, 0, 0.2, 1] }, // easeIn - bắt đầu chậm, kết thúc nhanh
        opacity: { duration: 0.5, ease: 'easeOut' },
        scale: { type: 'spring', stiffness: 100, damping: 15, duration: 0.6 },
      }}
      onAnimationComplete={() => {
        setCanStartTyping(true);
      }}
    >
      {displayedMessage && (
        <div className='mb-3 absolute bottom-[60%] w-max max-w-[180px] left-[99%] px-3 py-1 rounded-[12px] bg-gradient-to-r from-[#0E5AD4] to-[#2E89FF] text-white text-[12px] font-medium shadow-md'>
          {displayedMessage}
          <span className=' absolute bottom-1/2 translate-y-1/2 -left-[7px] -z-10 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-[#0E5AD4]' />
        </div>
      )}
      <img src={IMAGES.rocketBoyGif} alt='' className='h-[100px] w-[100px] 2xl:h-[125px] 2xl:w-[125px] object-contain' />
    </motion.div>
  );
});

RocketCharacter.displayName = 'RocketCharacter';

const Register = React.memo(props => {
  const initialState = {
    rememberMe: localStorage?.getItem('remembermeFMRP') ? localStorage?.getItem('remembermeFMRP') : false,
    onSending: false,
    listMajor: [],
    listPosition: [],
    checkMajior: null,
    typePassword: false,
    isRegister: false,
    stepRegister: 0,
    isLogin: true,
    sendOtp: false,
    checkOtp: false,
    countOtp: 0,
    name: '',
    code: '',
    checkValidateOtp: false,
  };

  const steps = [
    { id: 0, label: 'Bước 1/3: Lựa chọn ngành hàng của bạn', message: 'Hãy cho Fimo biết ngành hàng của bạn là gì nhé' },
    { id: 1, label: 'Bước 2/3: Nhập thông tin của bạn để đăng ký', message: 'Hãy cho Fimo biết thông tin của bạn nhé' },
    { id: 2, label: 'Bước 3/3: Nhập OTP', message: 'Giờ hãy nhập OTP Fimo vừa gửi bạn nhé!' },
  ];

  const { } = useSetings();

  const dataLang = props.dataLang;

  const dispatch = useDispatch();

  const router = useRouter();

  const showToat = useToast();

  const [isState, sIsState] = useState(initialState);

  const data = useSelector(state => state.availableLang);

  const queryState = key => sIsState(pver => ({ ...pver, ...key }));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const phone = watch('phone');

  const valueForm = watch();

  useEffect(() => {
    setValue('code', localStorage?.getItem('usercodeFMRP') ? localStorage?.getItem('usercodeFMRP') : '');
    setValue('name', localStorage?.getItem('usernameFMRP') ? localStorage?.getItem('usernameFMRP') : '');
    router.push('/auth/register');
  }, []);

  useEffect(() => {
    if (isState.isRegister && isState.countOtp > 0) {
      const timer = setTimeout(() => {
        queryState({ countOtp: isState.countOtp - 1 });
      }, 1000);
      // Clean up the timer when the component is unmounted or count changes
      return () => clearTimeout(timer);
    }
  }, [isState.countOtp, isState.isRegister]);

  ///Đăng ký
  const _HandleIsLogin = e => {
    queryState({ isLogin: e });
  };

  const { isLoading: isLoadingMajior } = useQuery({
    queryKey: ['api_majior'],
    queryFn: async () => {
      const res = await apiLogin.apiMajior();
      queryState({ listMajor: res?.career, listPosition: res?.role_user });
      return res;
    },
    placeholderData: keepPreviousData,
    ...optionsQuery,
  });

  const _HandleSelectStep = step => {
    if (step === 0) {
      queryState({ stepRegister: 0 });
      return;
    }
    if (isState.checkMajior) {
      queryState({ stepRegister: step });
      return;
    }
    showToat('error', 'Vui lòng chọn ngành hàng của bạn');
  };

  const submitOtp = useMutation({
    mutationFn: data => {
      return apiLogin.apiRegister(data);
    },
    retry: 10,
    retryDelay: 5000,
  });

  const submitResendOtp = useMutation({
    mutationFn: data => {
      return apiLogin.apiRegister(data);
    },
    retry: 10,
    retryDelay: 5000,
  });

  const fnSetDataAuth = (value, res) => {
    const { isSuccess, message, token, database_app } = res;
    dispatch({ type: 'auth/update', payload: res.data?.data });
    CookieCore.set('tokenFMRP', token, {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      sameSite: true,
    });
    CookieCore.set('databaseappFMRP', database_app, {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
    showToat('success', message);
    if (isState.rememberMe) {
      localStorage.setItem('usernameFMRP', value.name);
      localStorage.setItem('usercodeFMRP', value.code);
      localStorage.setItem('remembermeFMRP', isState.rememberMe);
    } else {
      ['usernameFMRP', 'usercodeFMRP', 'remembermeFMRP'].forEach(key => localStorage.removeItem(key));
    }
    router.push('/');

    // setTimeout(() => {
    //     router.replace("/dashboard");
    // }, 2000);
  };

  const onSubmit = async (data, type) => {
    if (type == 'login') {
      try {
        const res = await apiLogin.apiLoginMain({
          data: {
            company_code: data.code,
            user_name: data.name,
            password: data.password,
          },
        });
        if (res?.isSuccess) {
          router.replace('/dashboard');
          fnSetDataAuth(data, res);
          return;
        }
        showToat('error', `${res?.message || 'Đăng nhập thất bại'}`);
      } catch (error) { }
    }

    if (type == 'sendOtp') {
      // await handleSendOtp(data?.phone);
      setValue('otp', '');
      queryState({ checkValidateOtp: true });
      const dataSubmit = new FormData();
      dataSubmit.append('career', data?.major);
      dataSubmit.append('company_name', data?.companyName);
      dataSubmit.append('fullname', data?.fullName);
      dataSubmit.append('email', data?.email);
      dataSubmit.append('phone_number', data?.phone);
      dataSubmit.append('address', data?.city);
      dataSubmit.append('password', data?.password);
      dataSubmit.append('role_user', data?.location);
      dataSubmit.append('type', 'send_otp_mail');

      const r = await submitResendOtp.mutateAsync(dataSubmit);
      if (r?.isSuccess) {
        showToat('success', r?.message);
        queryState({ isRegister: true, countOtp: 300, checkValidateOtp: true });
        // Tự động chuyển sang bước 3 sau khi gửi OTP thành công
        if (isState.stepRegister === 1) {
          queryState({ stepRegister: 2 });
        }
        return;
      }
      showToat('error', r?.message);
      queryState({ checkValidateOtp: false });
    }

    if (type == 'checkOtp') {
      // await handleVeryfyOtp(data?.otp);
    }

    if (type == 'register') {
      queryState({ sendOtp: true });

      const dataSubmit = new FormData();
      dataSubmit.append('is_web', 1);
      dataSubmit.append('career', data?.major);
      dataSubmit.append('company_name', data?.companyName);
      dataSubmit.append('fullname', data?.fullName);
      dataSubmit.append('email', data?.email);
      dataSubmit.append('phone_number', data?.phone);
      dataSubmit.append('address', data?.city);
      dataSubmit.append('password', data?.password);
      dataSubmit.append('role_user', data?.location);

      if (isState.isRegister) {
        dataSubmit.append('otp_code', data?.otp);
      }
      try {
        const res = await submitOtp.mutateAsync(dataSubmit);
        if (res?.isSuccess) {
          //google ads
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'enhanced_conversion',
            email: data?.email,
            phone: data?.phone,
          });
          queryState({
            name: res?.email,
            code: res?.code,
            isRegister: false,
            isLogin: true,
            countOtp: 0,
          });
          fnSetDataAuth(data, res);
          return;
        }
        queryState({ sendOtp: false });
        showToat('error', res?.message);
      } catch (error) { }
    }
  };

  return (
    <>
      <Head>
        <title>Đăng ký</title>
      </Head>
      <Script id='gtm-script' strategy='afterInteractive'>
        {`
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','GTM-M7HZ95L2');
                `}
      </Script>
      <div className='grid w-screen h-screen grid-cols-5 overflow-hidden'>
        <div className='hidden lg:block col-span-2 bg-[#11315B] h-screen relative'>
          <Image
            src='/register/img.png'
            alt='background'
            width={828}
            height={1261}
            quality={100}
            className='object-contain w-full h-auto pointer-events-none select-none'
            loading='lazy'
            crossOrigin='anonymous'
            placeholder='blur'
            blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
          />
          <div className='absolute bottom-[10%] left-[15%] z-[1]'>
            <Image
              alt='logo'
              src='/icon/logo-login.png'
              width={200}
              height={70}
              unoptimized
              quality={100}
              className='object-contain w-auto h-[60px] select-none pointer-events-none'
              loading='lazy'
              crossOrigin='anonymous'
              placeholder='blur'
              blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
            />
            <h2 className='text-white text-2xl font-[600] mt-8 capitalize'>Đăng ký tài khoản</h2>
            <h6 className='mt-3 text-white'>Hỗ trợ đăng ký: 0901.13.6968 - 0981.89.3353</h6>
          </div>
        </div>
        <div className='h-full col-span-5 lg:col-span-3 bg-white '>
          <Customscrollbar scrollableNodePropsClassName={`  ${Object.keys(errors).length === 0 ? '[&>div]:h-full' : '[&>div]:my-3'}`} className='h-screen'>
            <div className={`flex flex-col gap-1 items-center px-2 lg:px-0 h-full justify-center`}>
              <div className='flex flex-col-reverse lg:flex-row items-center gap-2'>
                <h1 className='text-[#11315B] font-semibold 2xl:text-xl text-[18.5px] text-center capitalize'>Bước Vào Kỷ Nguyên Số Hóa Sản Xuất Cùng</h1>
                <div className='w-[80px] h-auto '>
                  <Image src={'/LOGOLOGIN-1.png'} width={1280} height={1024} alt='@logo' className='object-cover w-full h-full' />
                </div>
              </div>
              <div className='flex flex-col items-center gap-2 text-center'>
                <h3 className=' text-[#667085]/70 text-[15px]'>{steps[isState.stepRegister]?.label}</h3>
              </div>
              <div className='[@media(min-width:1440px)]:w-[55%] xl:w-[62%] lg:w-[70%] my-2 flex flex-col gap-2 pt-[10px] 2xl:pt-[40px]'>
                <div className='relative h-[100px] -z-10'>
                  {/* ==== step ==== */}
                  <div className=' relative flex items-end h-full -z-10'>
                    <RocketCharacter message={steps[isState.stepRegister]?.message} stepRegister={isState.stepRegister} totalSteps={steps.length} />
                  </div>
                  <div className='grid grid-cols-3 gap-1 h-full'>
                    {steps.map(step => (
                      <div key={step.id} className='flex items-end justify-center pb-2'>
                        <div className='w-[2px] h-[50%] bg-transparent' />
                      </div>
                    ))}
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-1'>
                  {steps.map(step => (
                    <div key={step.id} className='w-full h-1.5 rounded-full bg-[#F3F4F6] relative overflow-hidden'>
                      <div className={`${isState.stepRegister >= step.id ? 'w-full' : 'w-0'} duration-700 bg-[#3276FA] transition-[width] h-full absolute`} />
                    </div>
                  ))}
                </div>
                {isState.stepRegister === 0 && (
                  <div className='grid grid-cols-3 gap-3 mt-2 2xl:gap-5 3xl:mt-5 xxl:mt-1'>
                    {isLoadingMajior ? (
                      <>
                        {Array.from({ length: 9 }).map((_, Register) => (
                          <div key={Register} className='h-[135px] w-full bg-slate-100 animate-pulse rounded-md'></div>
                        ))}
                      </>
                    ) : (
                      isState.listMajor.map((e, index) => (
                        <label key={e?.id?.toString()} htmlFor={`major ${e?.id}`} className='w-full h-full cursor-pointer  rounded-md border border-[#DDDDE2] relative'>
                          <div className='flex flex-col items-center justify-between w-full h-full gap-1 2xl:gap-2 px-1 py-3 select-none 2xl:p-5'>
                            <input
                              type='radio'
                              id={`major ${e?.id}`}
                              {...register(`major`)}
                              onChange={e => {
                                queryState({ checkMajior: e.target.checked });
                              }}
                              value={e?.id}
                              // name="major register"
                              className='2xl:w-5 w-4 2xl:h-5 h-4 accent-[#1847ED] peer relative z-[1]'
                            />
                            <Image alt={e?.title} src={e?.img} width={44} height={44} quality={80} className='w-auto 2xl:h-[48px] h-[30px] object-contain relative z-[1]' />
                            <label className='text-[#1760B9] relative z-[1] 2xl:text-base xl:text-sm [@media(min-width:1336px)]:text-[13px] text-[13px] text-center'>{e?.title}</label>
                            <div className='w-full h-full peer-checked:bg-[#E2F0FE]/40 absolute top-0 left-0 transition duration-300 peer-checked:border border-[#C7DFFB] rounded-md' />
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}
                {isState.stepRegister === 1 && (
                  <div className='space-y-2'>
                    <div className='space-y-1'>
                      <label className='text-sm'>
                        Họ và tên của bạn
                        <span className='p-1 text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='fullName'
                        {...register('fullName', {
                          required: true,
                        })}
                        placeholder='Nhập họ và tên của bạn'
                        className={`${errors.fullName ? 'border-red-500 border' : 'border-[#D0D5DD] border focus:border-[#3276FA]'
                          } w-full  placeholder:text-[13px] text-[13px] p-2.5 outline-none  rounded`}
                      />
                      {errors.fullName && <span className='text-xs text-red-500'>Vui lòng nhập họ và tên</span>}
                    </div>
                    <div className='space-y-1'>
                      <label className='text-sm'>
                        Tên công ty
                        <span className='p-1 text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='companyName'
                        {...register('companyName', {
                          required: true,
                        })}
                        placeholder='Nhập tên công ty'
                        className={`${errors.companyName ? 'border-red-500 border' : 'border-[#D0D5DD] border focus:border-[#3276FA]'
                          } w-full placeholder:text-[13px] text-[13px]  p-2.5 outline-none  rounded`}
                      />
                      {errors.fullName && <span className='text-xs text-red-500'>Vui lòng nhập tên công ty</span>}
                    </div>
                    <div className='grid items-center- grid-cols-2  gap-y-2 gap-x-5 '>
                      <div className='space-y-1 '>
                        <label className='text-sm'>
                          Email của bạn
                          <span className='p-1 text-red-500'>*</span>
                        </label>
                        <input
                          type='email'
                          name='email'
                          {...register('email', {
                            required: true,
                            pattern: {
                              value: /\S+@\S+\.\S+/,
                              message: 'Nhập đúng định dạng email',
                            },
                          })}
                          placeholder='Nhập Email của bạn'
                          className={`${errors.email ? 'border-red-500 border' : 'border-[#D0D5DD] border focus:border-[#3276FA]'
                            } w-full  placeholder:text-[13px] text-[13px] p-2.5 outline-none  rounded`}
                        />
                        {errors.email && (
                          <span className='text-xs text-red-500' role='alert'>
                            {errors.email.message || 'Vui lòng nhập email'}
                          </span>
                        )}
                      </div>
                      <div className='space-y-1'>
                        <label className='text-sm'>
                          Số điện thoại
                          <span className='p-1 text-red-500'>*</span>
                        </label>
                        <input
                          type='text'
                          name='phone'
                          {...register('phone', {
                            required: {
                              value: true,
                              message: 'Vui lòng nhập số điện thoại',
                            },
                            minLength: {
                              value: 10,
                              message: 'Số điện thoại tối thiểu 10 số',
                            },
                            maxLength: {
                              value: 11,
                              message: 'Số điện thoại tối đa 10 số',
                            },
                            pattern: {
                              value: /^(0|\+84)(\d{9})$/,
                              message: 'Số điện thoại không hợp lệ',
                            },
                          })}
                          placeholder='Nhập số điện thoại'
                          className={`${errors.phone ? 'border-red-500 border' : 'border-[#D0D5DD] border focus:border-[#3276FA] '
                            } w-full  placeholder:text-[13px] text-[13px] p-2.5 outline-none  rounded`}
                        />

                        {errors.phone && <span className='text-xs text-red-500'>{errors.phone.message}</span>}
                      </div>
                      <div className='space-y-1'>
                        <label className='text-sm'>Tỉnh / Thành phố</label>
                        <input
                          type='text'
                          name='city'
                          {...register('city')}
                          placeholder='Nhập tỉnh / Thành phố'
                          className='w-full border placeholder:text-[13px] border-[#D0D5DD] p-2 outline-none focus:border-[#3276FA] rounded'
                        />
                      </div>
                      <div className='space-y-1'>
                        <label className='text-sm placeholder:text-[13px]'>
                          Mật khẩu
                          <span className='p-1 text-red-500'>*</span>
                        </label>
                        <div className='relative'>
                          <input
                            type={isState.typePassword ? 'text' : 'password'}
                            name='password'
                            {...register('password', {
                              required: true,
                              minLength: 10,
                            })}
                            placeholder='Nhập mật khẩu'
                            className={`${errors.password ? 'border-red-500 border' : 'border-[#D0D5DD] border focus:border-[#3276FA] '
                              } w-full placeholder:text-[13px] text-[13px]  p-2.5 outline-none  rounded`}
                          />
                          <button
                            type='button'
                            onClick={() =>
                              queryState({
                                typePassword: !isState.typePassword,
                              })
                            }
                            className='absolute translate-y-1/2 -top-1 right-3'
                          >
                            {isState.typePassword ? <IconEyeSlash /> : <IconEye />}
                          </button>
                        </div>
                        {errors.password && errors.password.type === 'required' && <span className='text-xs text-red-500'>Vui lòng nhập mật khẩu</span>}
                        {errors.password && errors.password.type === 'minLength' && <span className='text-xs text-red-500'>Tối thiểu 10 ký tự</span>}
                      </div>
                    </div>
                    <div className='space-y-1.5'>
                      <label className='text-sm'>
                        Vị trí công việc
                        <span className='p-1 text-red-500'>*</span>
                      </label>
                      <div className='flex flex-wrap items-center gap-4'>
                        {isState.listPosition.map(e => (
                          <div key={e?.id?.toString()} className='flex items-center gap-1'>
                            <input
                              id={`posiiton ${e?.id}`}
                              type='radio'
                              {...register('location', {
                                required: true,
                              })}
                              value={e?.id}
                              name='location'
                              className='accent-[#1847ED] 2xl:scale-110'
                            />
                            <label htmlFor={`posiiton ${e?.id}`} className={`${errors.location ? 'text-[#52575E]' : 'text-[#52575E]'} text-sm cursor-pointer`}>
                              {e?.title}
                            </label>
                          </div>
                        ))}
                      </div>
                      {errors.location && <span className='text-xs text-red-500'>Vui lòng chọn vị trí công việc</span>}
                    </div>
                  </div>
                )}
                {isState.stepRegister === 2 && (
                  <div className='space-y-4 mt-4 mb-2'>
                    <div className='space-y-[24px]'>
                      <p className='text-sm text-black'>
                        Nhập mã xác thực OTP được gửi đến zalo : <strong>{formatPhone(phone) || 'số điện thoại của bạn'}</strong>
                      </p>
                      <input
                        type='number'
                        placeholder='Nhập mã OTP'
                        name='otp'
                        {...register('otp', {
                          required: {
                            value: true,
                            message: 'Vui lòng nhập mã xác thực',
                          },
                          minLength: {
                            value: 6,
                            message: 'Mã xác thực tối thiểu 6 số',
                          },
                          maxLength: {
                            value: 6,
                            message: 'Mã xác thực tối đa 6 số',
                          },
                        })}
                        min={0}
                        className={`${errors.otp ? 'border-red-500 border' : 'border-[#D0D5DD] border focus:border-[#3276FA]'
                          } w-full placeholder:text-[13px]- text-[13px]- py-3 px-4 outline-none rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                      />
                      {errors.otp && <span className='text-xs text-red-500'>{errors.otp.message}</span>}
                    </div>
                    <div className='text-center text-sm text-[#667085]'>
                      Chưa nhận được mã OTP? Chờ{' '}
                      {isState.countOtp > 0 ? (
                        <strong>{isState.countOtp}s</strong>
                      ) : (
                        <button
                          type='button'
                          onClick={() => {
                            queryState({ checkValidateOtp: false });
                            handleSubmit(data => onSubmit(data, 'sendOtp'))();
                          }}
                          className='text-[#5599EC] hover:underline'
                          disabled={submitResendOtp.isPending}
                        >
                          {submitResendOtp.isPending ? <LoadingButton /> : <strong>Gửi lại</strong>}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {isState.stepRegister === 0 && (
                  <>
                    <button
                      onClick={_HandleSelectStep.bind(this, 1)}
                      className=' bg-gradient-to-l flex items-center justify-center gap-2 from-[#0375f3]  via-[#296dc1] to-[#0375f3] btn-animation hover:scale-105 w-full py-3 text-center rounded bg text-white 3xl:mt-5 xl:mt-2 2xl:mt-2 mt-5'
                    >
                      <p>Tiếp Theo</p>
                    </button>
                    <div className='flex justify-center gap-2 mt-1'>
                      <span className='font-[300] '>Bạn đã có tài khoản?</span>
                      <button type='button' onClick={() => router.push('/auth/login')} className='text-[#5599EC]'>
                        Đăng nhập ngay
                      </button>
                    </div>
                  </>
                )}
                {isState.stepRegister === 1 && (
                  <>
                    <div className='flex gap-2 mt-3 mb-3'>
                      <button onClick={_HandleSelectStep.bind(this, 0)} className='w-full py-3 text-center rounded bg bg-white text-[#667085] border border-[#D0D5DD]'>
                        Quay lại
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          handleSubmit(
                            data => {
                              // Validate form trước khi chuyển bước
                              onSubmit(data, 'sendOtp');
                            },
                            errors => {
                              // Nếu có lỗi validation, hiển thị thông báo
                              const firstError = Object.keys(errors)[0];
                              if (firstError) {
                                showToat('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
                              }
                            }
                          )();
                        }}
                        disabled={submitResendOtp.isPending}
                        className={`${submitResendOtp.isPending ? 'cursor-not-allowed' : 'cursor-pointer'
                          } flex items-center gap-2 justify-center w-full py-3 text-center rounded bg-gradient-to-l from-[#0375F3] via-[#296dc1] to-[#0375F3] btn-animation hover:scale-105 text-white`}
                      >
                        {submitResendOtp.isPending ? <LoadingButton /> : <p className='capitalize'>Tiếp tục</p>}
                      </button>
                    </div>
                  </>
                )}
                {isState.stepRegister === 2 && (
                  <>
                    <div className='flex gap-2 mt-3'>
                      <button onClick={_HandleSelectStep.bind(this, 1)} className='w-full py-3 text-center rounded bg bg-white text-[#667085] border border-[#D0D5DD]'>
                        Quay lại
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          handleSubmit(data => onSubmit(data, 'register'))();
                        }}
                        disabled={submitOtp.isPending}
                        className={`${submitOtp.isPending ? 'cursor-not-allowed' : 'cursor-pointer'
                          } flex items-center gap-2 justify-center w-full py-3 text-center rounded bg-gradient-to-l from-[#0375F3] via-[#296dc1] to-[#0375F3] btn-animation hover:scale-105 text-white`}
                      >
                        {submitOtp.isPending ? (
                          <div className='flex items-center justify-center gap-2'>
                            <LoadingButton hiddenTitle />
                            <h2>Khởi tạo dữ liệu ...</h2>
                          </div>
                        ) : (
                          <p className='capitalize'>Đăng ký</p>
                        )}
                      </button>
                    </div>
                    <div className='flex justify-start gap-2 mt-6'>
                      <span className='font-[300] text-sm'>Bạn đã có tài khoản?</span>
                      <button type='button' onClick={() => router.push('/auth/login')} className='text-[#5599EC] text-sm'>
                        Đăng nhập ngay
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Customscrollbar>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 z-[100] 2xl:bottom-8 2xl:right-8">
        <QuickSupportButton typingSpeed={100} repeatDelay={3500} />
      </div>
    </>
  );
});

const BtnLang = React.memo(props => {
  const dispatch = useDispatch();

  const _HandleShowLang = () => {
    dispatch({ type: 'lang/update', payload: props.code });
    localStorage.setItem('LanguagesFMRP', props.code);
  };
  return <button onClick={_HandleShowLang.bind(this)}>{props.label}</button>;
});
export default Register;
