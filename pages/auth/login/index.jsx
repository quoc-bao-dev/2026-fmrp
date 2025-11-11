'use client';
import apiLogin from '@/Api/apiLogin/apiLogin';
import { optionsQuery } from '@/configs/optionsQuery';
import { useSetings } from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from 'react-hook-form';
import Input from '../forgot-password/partials/Input';
import InputPassword from '../forgot-password/partials/InputPassword';
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import 'sweetalert2/src/sweetalert2.scss';
import TabSwitcherWithUnderline from '@/components/common/tab/TabSwitcherWithUnderline';

const Login = React.memo(props => {
  const initialState = {
    rememberMe: localStorage?.getItem('remembermeFMRP') ? localStorage?.getItem('remembermeFMRP') : false,
    onSending: false,
    listMajor: [],
    listPosition: [],
    checkMajior: null,
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

  const {} = useSetings();

  const dataLang = props.dataLang;

  const dispatch = useDispatch();

  const router = useRouter();

  const showToat = useToast();

  const [isState, sIsState] = useState(initialState);
  // [login] [step 2] Khởi tạo state tabs và tab đang active (Đăng nhập | QR)
  const tabsLogin = [
    { id: 'login', name: 'Tài khoản FRMP' },
    { id: 'qr', name: 'Quét QR' },
  ];
  const [activeTab, setActiveTab] = useState(tabsLogin[0]);

  const data = useSelector(state => state.availableLang);

  const queryState = key => sIsState(pver => ({ ...pver, ...key }));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const valueForm = watch();

  useEffect(() => {
    setValue('code', localStorage?.getItem('usercodeFMRP') ? localStorage?.getItem('usercodeFMRP') : '');
    setValue('name', localStorage?.getItem('usernameFMRP') ? localStorage?.getItem('usernameFMRP') : '');
    router.push('/auth/login');
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
    enabled: !isState.isLogin,
    ...optionsQuery,
  });

  const _HandleSelectStep = e => {
    if (isState.checkMajior) {
      queryState({ stepRegister: e });
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
    Cookies.set('tokenFMRP', token, {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      sameSite: true,
    });
    Cookies.set('databaseappFMRP', database_app, {
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
          fnSetDataAuth(data, res);
          return;
        }
        showToat('error', `${res?.message || 'Đăng nhập thất bại'}`);
      } catch (error) {}
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
        queryState({ isRegister: true, countOtp: 120, checkValidateOtp: true });
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
          queryState({ name: res?.email, code: res?.code, isRegister: false, isLogin: true, countOtp: 0 });
          fnSetDataAuth(data, res);
          return;
        }
        queryState({ sendOtp: false });
        showToat('error', res?.message);
      } catch (error) {}
    }
  };

  return (
    <>
      <Head>
        <title>{dataLang?.auth_login || 'auth_login'}</title>
      </Head>
      <div className='bg-[#EEF1F8]'>
        <div className="bg-[url('/Logo-BG.png')] relative bg-repeat-round h-screen w-screen flex flex-col justify-center items-center overflow-hidden">
          <div className='z-10 flex justify-center w-full space-x-20'>
            <div className=''>
              <form onSubmit={handleSubmit(data => onSubmit(data, 'login'))} className='bg-white px-16 py-8 flex flex-col gap-6 rounded-lg w-[600px]'>
                <div className=''>
                  <h1 className='text-[#11315B] font-medium text-3xl text-center capitalize'>{dataLang?.auth_login || 'auth_login'}</h1>
                </div>

                {/* [login] [step 1] Render Tabs underline để chuyển giữa Form đăng nhập và QR */}
                <div className='w-fit'>
                  <TabSwitcherWithUnderline tabs={tabsLogin} activeTab={activeTab} onChange={setActiveTab} />
                </div>

                {/* [login] [step 3] Kiểm tra tab đang active để render Form hoặc QR */}
                {activeTab?.id === 'login' ? (
                  /* [login] [step 4] Render Form đăng nhập khi tab "Đăng nhập" đang active */
                  <div className='flex flex-col gap-6'>
                    <div className='space-y-2'>
                      <Input type='text' name='code' {...register('code', { required: true })} placeholder='Mã công ty' error={errors.code ? { message: 'Vui lòng nhập mã công ty' } : null} />
                      <Input
                        type='text'
                        name='name'
                        {...register('name', { required: true })}
                        placeholder={dataLang?.auth_user_name || 'auth_user_name'}
                        error={errors.name ? { message: 'Vui lòng nhập email hoặc số điện thoại' } : null}
                      />
                      <InputPassword
                        name='password'
                        {...register('password', { required: true })}
                        placeholder={dataLang?.auth_password || 'auth_password'}
                        error={errors.password ? { message: 'Vui lòng nhập mật khẩu' } : null}
                      />
                      <div className='flex justify-between w-full'>
                        <div className='flex items-center space-x-1.5'>
                          <input
                            type='checkbox'
                            id='rememberMe'
                            {...register('rememberMe', { required: false })}
                            checked={isState.rememberMe ? true : false}
                            onChange={() => queryState({ rememberMe: !isState.rememberMe })}
                          />
                          <label htmlFor='rememberMe'>{dataLang?.auth_remember_login || 'auth_remember_login'}</label>
                        </div>
                        <Link href='/auth/forgot-password'>
                          <p className='text-[#3276FA] text-sm'>{dataLang?.auth_forgot_password || 'auth_forgot_password'}</p>
                        </Link>
                      </div>
                    </div>
                    <button
                      type='submit'
                      onClick={handleSubmit(data => onSubmit(data, 'login'))}
                      className='text-[#FFFFFF] font-normal text-lg py-3 w-full rounded-md bg-gradient-to-l from-[#0375f3]  via-[#296dc1] to-[#0375f3] btn-animation hover:scale-105'
                    >
                      {dataLang?.auth_login || 'auth_login'}
                    </button>
                  </div>
                ) : (
                  /* [login] [step 5] Render placeholder QR (div màu xám) khi tab "QR" đang active */
                  <div className='w-full h-[320px] bg-gray-200 rounded-md flex items-center justify-center text-[#667085]'>QR Placeholder</div>
                )}

                <div className='flex justify-center space-x-2'>
                  <span className='font-[300] '>Bạn chưa có tài khoản?</span>
                  <button
                    type='button'
                    // onClick={_HandleIsLogin.bind(this, false)}
                    onClick={() => router.push('/auth/register')}
                    className='text-[#5599EC]'
                  >
                    Đăng ký ngay
                  </button>
                </div>
                <div className='text-center text-[#667085] text-sm font-light flex items-center gap-1 w-full justify-center'>
                  <p>Power by</p>
                  <Link href='https://fososoft.vn' target='_blank' className='w-[45px] h-auto'>
                    <Image src={'/icon/logo-green.png'} width={1280} height={1024} alt='@logo' className='object-contain w-full h-full' />
                  </Link>
                </div>
              </form>
              {/* <div className="flex items-center justify-center space-x-6">
                                                <a href="#" className="text-[#344054] hover:text-[#0F4F9E] font-light text-sm">
                                                    Cổng dịch vụ khách hàng
                                                </a>
                                                <a href="#" className="text-[#344054] hover:text-[#0F4F9E] font-light text-sm">
                                                    User Pay
                                                </a>
                                                <a href="#" className="text-[#344054] hover:text-[#0F4F9E] font-light text-sm">
                                                    FMRP Website
                                                </a>
                                                <Popup
                                                    trigger={
                                                        <button className="text-[#344054] hover:text-[#0F4F9E]">
                                                            <IconMore />
                                                        </button>
                                                    }
                                                    closeOnDocumentClick
                                                    arrow={false}
                                                    position="right bottom"
                                                    on={["hover"]}
                                                    className={`dropdown-edit `}
                                                >
                                                    <div className="w-auto">
                                                        <div className="bg-white p-0.5 rounded-t w-60">
                                                            <button className="text-sm text-[#667085] hover:text-black font-semibold hover:bg-slate-100 text-left w-full px-5 rounded py-2.5">
                                                                Tạo phím tắt trên màn hình
                                                            </button>
                                                            <button className="text-sm text-[#667085] hover:text-black font-semibold hover:bg-slate-100 text-left w-full px-5 rounded py-2.5">
                                                                Yêu cầu Tư vấn qua điện thoại
                                                            </button>
                                                            <button className="text-sm text-[#667085] hover:text-black font-semibold hover:bg-slate-100 text-left w-full px-5 rounded py-2.5">
                                                                Tối ưu hóa trình duyệt
                                                            </button>
                                                            <button className="text-sm text-[#667085] hover:text-black font-semibold hover:bg-slate-100 text-left w-full px-5 rounded py-2.5">
                                                                Báo cáo lỗi
                                                            </button>
                                                            <button className="text-sm text-[#667085] hover:text-black font-semibold hover:bg-slate-100 text-left w-full px-5 rounded py-2.5">
                                                                Điều khiển
                                                            </button>
                                                            <button className="text-sm text-[#667085] hover:text-black font-semibold hover:bg-slate-100 text-left w-full px-5 rounded py-2.5">
                                                                Liên hệ
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Popup>
                                                {data.map((e) => (
                                                    <BtnLang key={e.label} {...e} />
                                                ))}
                                            </div> */}
            </div>
            <div className='space-y-4'>
              <div className='pointer-events-none select-none'>
                <Image
                  alt=''
                  width={200}
                  // src="/FMRP_Logo.png"
                  src='/LOGOLOGIN-1.png'
                  // src="/LOGO_LOGIN.png"
                  height={70}
                  quality={100}
                  className='object-contain'
                  loading='lazy'
                  crossOrigin='anonymous'
                  placeholder='blur'
                  blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                />
              </div>
              <div className='space-y-1'>
                <h1 className='text-[#344054] font-medium text-[19px] capitalize'>Trợ lý sản xuất</h1>
                <div className='space-y-1'>
                  <p className='text-[#344054] font-normal text-xl flex items-center'>
                    <FaQuoteLeft className='w-3 h-3 text-[#344054]' />
                    <span className='mx-2'>Tối ưu sản xuất, tối đa năng suất, tối thiểu lãng phí</span>
                    <FaQuoteRight className='w-3 h-3 text-[#344054]' />
                  </p>
                  <p className='text-[#667085] font-light text-[16px]'>
                    Hotline:
                    <span className='text-[#0F4F9E] font-normal ml-1'>0901.13.6968 - 0981.89.3353</span>
                  </p>
                  {/* <p className="text-[#667085] font-light text-[16px]">
                                                        Tổng đài:
                                                        <span className="text-[#0F4F9E] font-normal mx-1">028.7776.8880</span>
                                                        (Phím 1 - BP. Tư Vấn - Phím 2 - BP. Kỹ Thuật)
                                                    </p> */}
                </div>
              </div>
              <div className='pointer-events-none select-none'>
                <Image
                  alt=''
                  src='/qr.png'
                  width={120}
                  height={120}
                  quality={100}
                  className='object-contain w-auto h-auto '
                  loading='lazy'
                  crossOrigin='anonymous'
                  placeholder='blur'
                  blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                />
              </div>
            </div>
          </div>
          <div className='absolute -bottom-10 -right-10 pointer-events-none select-none'>
            <Image
              src='/bgImageLogin.png'
              alt=''
              width={500}
              height={500}
              quality={100}
              className='object-contain w-[600px] h-auto'
              loading='lazy'
              crossOrigin='anonymous'
              placeholder='blur'
              blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
            />
          </div>
        </div>
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
export default Login;
