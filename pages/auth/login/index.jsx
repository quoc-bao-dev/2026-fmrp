'use client';
import apiLogin from '@/Api/apiLogin/apiLogin';
import TabSwitcherWithUnderline from '@/components/common/tab/TabSwitcherWithUnderline';
import { optionsQuery } from '@/configs/optionsQuery';
import { useSetings } from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import { useCreateSessionLoginQR } from '@/managers/api/auth/useCreateSessionLoginQR';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from 'react-hook-form';
import { FaQuoteLeft, FaQuoteRight, FaRedoAlt } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import { useDispatch, useSelector } from 'react-redux';
import 'sweetalert2/src/sweetalert2.scss';
import Input from '../forgot-password/partials/Input';
import InputPassword from '../forgot-password/partials/InputPassword';
// [login-socket] [step 1] Import LoginSocketProvider và useLoginSocketContext
import { LoginSocketProvider, useLoginSocketContext } from '@/context/socket/LoginSocketContext';
// [session-web] Import hàm getOrCreateTabSession từ utils
import { getOrCreateTabSession } from '@/utils/helpers/sessionStorage';

// [login-socket] [step 2] Component con để sử dụng socket hook (bên trong Provider)
const LoginContent = React.memo(props => {
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

  const { refetch: refetchSetings } = useSetings();

  // [login-socket] [step 3] Lấy socket, loading, error từ LoginSocketContext
  const { socket, loading: socketLoading, error: socketError } = useLoginSocketContext();

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

  // State riêng để lưu dữ liệu form khi chuyển tab
  const [savedFormData, setSavedFormData] = useState({
    code: '',
    name: '',
    password: '',
  });

  const data = useSelector(state => state.availableLang);

  const queryState = key => sIsState(pver => ({ ...pver, ...key }));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const valueForm = watch();

  // Khởi tạo form từ localStorage chỉ lần đầu mount
  useEffect(() => {
    const savedCode = localStorage?.getItem('usercodeFMRP') || '';
    const savedName = localStorage?.getItem('usernameFMRP') || '';

    // Chỉ set lần đầu nếu có dữ liệu trong localStorage
    // Và cũng lưu vào savedFormData để giữ khi chuyển tab
    if (savedCode || savedName) {
      setValue('code', savedCode);
      setValue('name', savedName);
      setSavedFormData({
        code: savedCode,
        name: savedName,
        password: '',
      });
    }

    router.push('/auth/login');
  }, []); // Chỉ chạy 1 lần khi mount, không chạy lại khi chuyển tab

  // Lưu form data vào state riêng khi chuyển tab sang QR
  useEffect(() => {
    if (activeTab?.id === 'qr') {
      const currentCode = valueForm.code || '';
      const currentName = valueForm.name || '';
      const currentPassword = valueForm.password || '';

      setSavedFormData({
        code: currentCode,
        name: currentName,
        password: currentPassword,
      });
    }
  }, [activeTab?.id, valueForm.code, valueForm.name, valueForm.password]);

  // Khôi phục form data khi quay lại tab login (chỉ khi chuyển từ QR về login)
  const prevTabRef = useRef(activeTab?.id);
  const hasRestoredRef = useRef(false); // Track xem đã khôi phục chưa để tránh reset lại
  const savedFormDataRef = useRef(savedFormData); // Lưu ref để tránh closure issue

  // Cập nhật ref mỗi khi savedFormData thay đổi
  useEffect(() => {
    savedFormDataRef.current = savedFormData;
  }, [savedFormData]);

  useEffect(() => {
    const prevTab = prevTabRef.current;
    const currentTab = activeTab?.id;

    // Chỉ khôi phục khi chuyển từ tab QR về tab login và chưa khôi phục
    if (currentTab === 'login' && prevTab === 'qr' && savedFormDataRef.current && !hasRestoredRef.current) {
      // Sử dụng setTimeout để đảm bảo form đã được render xong
      setTimeout(() => {
        // Sử dụng giá trị từ ref để tránh closure issue
        const dataToRestore = savedFormDataRef.current;
        reset(
          {
            code: dataToRestore.code || '',
            name: dataToRestore.name || '',
            password: dataToRestore.password || '',
            rememberMe: isState.rememberMe || false,
          },
          {
            keepErrors: false,
            keepDirty: false,
            keepIsSubmitted: false,
            keepTouched: false,
            keepIsValid: false,
            keepSubmitCount: false,
          }
        );
        hasRestoredRef.current = true; // Đánh dấu đã khôi phục
      }, 0);
    }

    // Reset flag khi chuyển sang tab QR để cho phép khôi phục lại lần sau
    if (currentTab === 'qr') {
      hasRestoredRef.current = false;
    }

    // Cập nhật prevTabRef
    prevTabRef.current = currentTab;
  }, [activeTab?.id]); // Chỉ phụ thuộc vào activeTab, không phụ thuộc vào savedFormData

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

  // [set-qr] [step 1] Khởi tạo hook tạo phiên và state TTL/expired
  const {
    createSession,
    data: createSessionData,
    isLoading: isCreatingSession,
  } = useCreateSessionLoginQR({
    onSuccess: res => {
      // [set-qr] [step 2] Lưu TTL trả về từ API và reset trạng thái hết hạn
      const ttlSec = Number(res?.data?.ttl ?? 0);
      setQrTtl(ttlSec > 0 ? ttlSec : 0);
      setIsExpired(false);
    },
  });
  const [qrTtl, setQrTtl] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  /**
   * @typedef {Object} AppApprovedLoginData
   * @property {string} app_device_name - Tên thiết bị (ví dụ: "Iphone 17 ProMax")
   * @property {string} localtion_name - Tên địa điểm (ví dụ: "Hồ Chí Minh, Việt Nam")
   * @property {string} company_code - Mã công ty (ví dụ: "Z000Z64D")
   * @property {string} user_full_name - Tên đầy đủ người dùng (ví dụ: "trandachuy")
   * @property {string|null} user_avatar - URL avatar người dùng hoặc null
   */
  // [login-socket] [step 6] State lưu dữ liệu người dùng từ socket event app_approved_login
  const [approvedLoginData, setApprovedLoginData] = useState(null);

  /**
   * @typedef {Object} StatusActivePackage
   * @property {string} name - Tên trạng thái (ví dụ: "Đang Còn Hạn")
   * @property {number} status - Mã trạng thái (1 = còn hạn)
   */

  /**
   * @typedef {Object} CompanyInfo
   * @property {string} name - Tên công ty
   * @property {string} email - Email công ty
   * @property {string} phone_number - Số điện thoại công ty
   */

  /**
   * @typedef {Object} AppTokenLoginData
   * @property {string} user_email - Email người dùng
   * @property {string} user_full_name - Tên đầy đủ người dùng
   * @property {string|null} user_avatar - URL avatar hoặc null
   * @property {StatusActivePackage} status_active_package - Trạng thái gói dịch vụ
   * @property {string} number_of_users - Số lượng người dùng
   * @property {string} memory_storage - Dung lượng lưu trữ
   * @property {string} name_package_service - Tên gói dịch vụ (ví dụ: "Start Up")
   * @property {string} id_package_service - ID gói dịch vụ
   * @property {boolean} active_popup - Có hiển thị popup không
   * @property {CompanyInfo} company - Thông tin công ty
   * @property {string} start_date - Ngày bắt đầu (format: "YYYY-MM-DD")
   * @property {string} expiration_date - Ngày hết hạn (format: "YYYY-MM-DD")
   * @property {string} code_company - Mã công ty
   * @property {number} day_expiration - Số ngày còn lại trước khi hết hạn
   * @property {boolean} fail_expiration - Đã hết hạn chưa
   * @property {string|null} expire_status - Trạng thái hết hạn
   * @property {boolean} trial - Có phải trial không
   * @property {boolean} is_admin - Có phải admin không
   * @property {string} staffid - ID nhân viên
   * @property {Array} permissions_current - Danh sách quyền hiện tại
   */

  /**
   * @typedef {Object} AppTokenLoginResponse
   * @property {boolean} isSuccess - Trạng thái thành công
   * @property {string} message - Thông báo (ví dụ: "Đăng nhập thành công")
   * @property {string} token - JWT token để authenticate
   * @property {string} database_app - Tên database (ví dụ: "fmrpclient_Z000Z64D")
   * @property {AppTokenLoginData} data - Dữ liệu người dùng và công ty
   */

  useEffect(() => {
    // [set-qr] [step 3] Chỉ gọi API tạo phiên khi tab QR đang active
    if (activeTab?.id === 'qr') {
      const hasToken = !!createSessionData?.data?.session_token;
      if (!hasToken || isExpired) {
        const session_web = getOrCreateTabSession();
        createSession({ session_web });
      }
    }
  }, [activeTab?.id]);

  useEffect(() => {
    // [set-qr] [step 4] Đếm ngược TTL; khi 0 thì đánh dấu hết hạn
    // [set-qr] [step 4.1] Chỉ chạy interval khi đang ở tab QR để tránh chạy khi unmount
    const timer = setInterval(() => {
      if (activeTab?.id !== 'qr') {
        clearInterval(timer);
        return;
      }

      setQrTtl(prev => {
        const next = (prev ?? 0) - 1;
        if (next <= 0) {
          clearInterval(timer);
          setIsExpired(true);
          setApprovedLoginData(null);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [qrTtl, isExpired, activeTab?.id]);

  // [set-qr] [step 5] Xử lý reload phiên khi hết hạn
  const handleReloadQR = () => {
    setIsExpired(false);
    setQrTtl(0);
    const session_web = getOrCreateTabSession();
    createSession({ session_web });
  };

  // [login-socket] [step 4] Lắng nghe các sự kiện socket khi có socket instance
  useEffect(() => {
    if (!socket) return;

    // [login-socket] [step 5] Lắng nghe khi socket kết nối thành công
    const handleConnect = () => {
      // console.log('🔌 Login socket connected:', socket.id);
    };

    /**
     * [login-socket] [step 6] Handler xử lý khi nhận được event app_approved_login từ socket
     * @param {AppApprovedLoginData} data - Dữ liệu người dùng đã approve login từ mobile app
     */
    const handleAppApprovedLogin = data => {
      console.log('App approved login:', data);
      // [login-socket] [step 6.1] Lưu dữ liệu vào state để render UI

      setApprovedLoginData(data.data);
    };

    /**
     * [login-socket] [step 10] Handler xử lý khi nhận được event app_token_login từ socket
     * @param {AppTokenLoginResponse} data - Dữ liệu login response từ server
     */
    const handleAppTokenLogin = ({ data }) => {
      console.log('App token login:', data);
      // [login-socket] [step 10.1] Gọi hàm xử lý login tự động
      handleSocketLogin(data);
    };

    const handleAppRejectLogin = ({ data }) => {
      console.log('App reject login:', data);
      // const { login } = data;

      if (true) {
        showToat('error', 'Đăng nhập thất bại');
        setIsExpired(true);
        setQrTtl(0);
        setApprovedLoginData(null);
        return;
      }
    };

    // [login-socket] [step 7] Đăng ký listeners
    socket.on('connect', handleConnect);
    socket.on('app_approved_login', handleAppApprovedLogin);
    socket.on('app_token_login', handleAppTokenLogin);
    socket.on('app_reject_login', handleAppRejectLogin);
    socket.on('connect_error', err => {
      console.error('Login socket error:', err);
    });

    // [login-socket] [step 8] Cleanup: remove listeners khi unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('app_approved_login', handleAppApprovedLogin);
      socket.off('app_token_login', handleAppTokenLogin);
      socket.off('app_reject_login', handleAppRejectLogin);
      socket.off('connect_error');
    };
  }, [socket]);

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

  /**
   * [login-socket] [step 11] Xử lý login từ socket event (không cần form data)
   * @param {AppTokenLoginResponse} res - Response từ socket event app_token_login
   */
  const handleSocketLogin = res => {
    console.log('handleSocketLogin', res);
    try {
      const { isSuccess, message, token, database_app, data } = res;

      // [login-socket] [step 11.1] Kiểm tra isSuccess
      if (!isSuccess) {
        showToat('error', message || 'Đăng nhập thất bại');
        return;
      }

      // [login-socket] [step 11.2] Kiểm tra dữ liệu hợp lệ
      if (!token || !database_app) {
        showToat('error', 'Dữ liệu đăng nhập không hợp lệ');
        return;
      }

      // [login-socket] [step 11.3] Dispatch Redux auth state
      console.log('dispatch', data);

      dispatch({ type: 'auth/update', payload: data });

      // [login-socket] [step 11.4] Lưu token vào Cookies
      Cookies.set('tokenFMRP', token, {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        sameSite: true,
      });

      // [login-socket] [step 11.5] Lưu database_app vào Cookies
      Cookies.set('databaseappFMRP', database_app, {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });

      // [login-socket] [step 11.6] Hiển thị toast success
      showToat('success', message);

      refetchSetings();
      // [login-socket] [step 11.7] Redirect về trang chủ
      console.log('showToat', message);
      setTimeout(() => {
        router.push('/');
      }, 300);
    } catch (error) {
      console.error('Login error:', error);
      showToat('error', 'Có lỗi xảy ra khi đăng nhập');
    }
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
                      <Input
                        type='text'
                        name='code'
                        {...register('code', { required: true })}
                        value={valueForm.code || ''}
                        placeholder='Mã công ty'
                        error={errors.code ? { message: 'Vui lòng nhập mã công ty' } : null}
                      />
                      <Input
                        type='text'
                        name='name'
                        {...register('name', { required: true })}
                        value={valueForm.name || ''}
                        placeholder={dataLang?.auth_user_name || 'auth_user_name'}
                        error={errors.name ? { message: 'Vui lòng nhập email hoặc số điện thoại' } : null}
                      />
                      <InputPassword
                        name='password'
                        {...register('password', { required: true })}
                        value={valueForm.password || ''}
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
                  /* [login] [step 5] Render QR Code hoặc thông tin người dùng khi tab "QR" đang active */
                  <>
                    {(() => {
                      // [login-socket] [step 9] Kiểm tra nếu có dữ liệu approved login thì render thông tin người dùng
                      if (approvedLoginData && !isExpired) {
                        /**
                         * @type {AppApprovedLoginData}
                         */
                        const userData = approvedLoginData;
                        return (
                          <div className='w-full flex flex-col items-center justify-center gap-4 py-6'>
                            {/* [login-socket] [step 9.1] Avatar người dùng */}
                            <div className='w-24 h-24 rounded-full bg-gradient-to-br from-[#0375f3] to-[#296dc1] flex items-center justify-center text-white text-2xl font-semibold shadow-lg'>
                              {userData.user_avatar ? (
                                <img src={userData.user_avatar} alt={userData.user_full_name} className='w-full h-full rounded-full object-cover object-center' />
                              ) : (
                                <span>{userData.user_full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                              )}
                            </div>

                            {/* [login-socket] [step 9.2] Tên người dùng */}
                            <div className='text-center'>
                              <h3 className='text-[#11315B] font-semibold text-xl'>{userData.user_full_name}</h3>
                              <p className='text-[#667085] text-sm mt-1'>{userData.company_code}</p>
                            </div>

                            {/* [login-socket] [step 9.3] Thông tin thiết bị và địa điểm */}
                            <div className='w-full space-y-2 bg-[#F9FAFB]- rounded-lg p-4'>
                              <div className='flex items-center gap-2 text-sm'>
                                <span className='text-[#667085] min-w-[100px]'>Thiết bị:</span>
                                <span className='text-[#344054] font-medium'>{userData.app_device_name}</span>
                              </div>

                              {userData.localtion_name && (
                                <div className='flex items-center gap-2 text-sm'>
                                  <span className='text-[#667085] min-w-[100px]'>Địa điểm:</span>
                                  <span className='text-[#344054] font-medium'>{userData.localtion_name}</span>
                                </div>
                              )}
                            </div>

                            {/* [login-socket] [step 9.4] Thông báo đang xử lý đăng nhập */}
                            <div className='flex items-center gap-2 text-[#0F4F9E] text-sm'>
                              <div className='w-2 h-2 bg-[#0F4F9E] rounded-full animate-pulse'></div>
                              <span>Đang chờ đăng nhập...</span>
                            </div>
                            {!isExpired && qrTtl > 0 && <p className='text-xs text-[#667085] text-center'>Hết hạn sau {qrTtl}s</p>}
                          </div>
                        );
                      }

                      // [set-qr] [step 6] Nếu chưa có dữ liệu approved, hiển thị QR Code
                      const sessionToken = createSessionData?.data?.session_token || '';
                      const qrUrl = sessionToken;
                      return (
                        <div className='w-full flex flex-col items-center justify-center gap-3 py-6'>
                          {/* [set-qr] [step 7] Hiển thị QR; khi hết hạn thì blur và chặn tương tác */}
                          <div className='pb-4 text-center text-[#667085] text-sm font-light'>Dùng ứng dụng FMRP trên điện thoại quét QR để đăng nhập</div>
                          <div className={`relative`}>
                            <div className={`bg-white p-4 rounded-md shadow-sm ${isExpired || !qrUrl ? 'blur-md' : ''}`}>
                              <QRCode value={qrUrl || 'about:blank'} size={220} bgColor='#ffffff' fgColor='#000000' level='M' />
                            </div>
                            {/* [set-qr] [step 8] Overlay nút reload ở giữa khi hết hạn */}
                            {isExpired && (
                              <div className='absolute inset-0 flex items-center justify-center'>
                                <button
                                  type='button'
                                  onClick={handleReloadQR}
                                  aria-label='Tạo lại QR'
                                  className='p-3 rounded-full bg-[#0F4F9E] text-white shadow hover:opacity-90 flex items-center justify-center'
                                >
                                  <FaRedoAlt className='w-5 h-5' />
                                </button>
                              </div>
                            )}
                          </div>
                          {/* [set-qr] [step 9] Hiển thị đếm ngược TTL */}
                          {!isExpired && qrTtl > 0 && <p className='text-xs text-[#667085] text-center'>Hết hạn sau {qrTtl}s</p>}
                        </div>
                      );
                    })()}
                  </>
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

// [login-socket] [step 9] Component chính wrap với LoginSocketProvider
const Login = React.memo(props => {
  // [login-socket] [step 10] Lấy dataSetting từ Redux (giống hệ thống hiện tại)
  const dataSetting = useSelector(state => state.setings);

  // [login-socket] [step 11] Tạo payload với placeholder [payload] và socket_url từ dataSetting
  const loginSocketPayload = {
    user_id: '1', // [payload] Thay bằng giá trị thực tế
    db_name: getOrCreateTabSession(), // [payload] Thay bằng giá trị thực tế
    user_name: 'fososoft', // [payload] Thay bằng giá trị thực tế
    socket_url: dataSetting?.socket_link_connect || '', // Lấy từ dataSetting giống hệ thống
  };

  // [login-socket] [step 12] Wrap LoginContent với LoginSocketProvider
  return (
    <LoginSocketProvider payload={loginSocketPayload}>
      <LoginContent {...props} />
    </LoginSocketProvider>
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
