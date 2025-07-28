"use client";
import apiLogin from "@/Api/apiLogin/apiLogin";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import LoadingButton from "@/components/UI/loading/loadingButton";
import { optionsQuery } from "@/configs/optionsQuery";
import { useSetings } from "@/hooks/useAuth";
import useToast from "@/hooks/useToast";
import { CookieCore } from "@/utils/lib/cookie";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Building,
    Eye as IconEye,
    EyeSlash as IconEyeSlash,
} from "iconsax-react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import { FiRefreshCcw } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import "sweetalert2/src/sweetalert2.scss";
import Script from "next/script";


const formatPhone = (phone) => {
    // Xoá hết dấu cách và ký tự không phải số
    const digits = phone.replace(/\D/g, "");

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

const Register = React.memo((props) => {
    const initialState = {
        rememberMe: localStorage?.getItem("remembermeFMRP")
            ? localStorage?.getItem("remembermeFMRP")
            : false,
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
        name: "",
        code: "",
        checkValidateOtp: false,
    };

    const { } = useSetings();

    const dataLang = props.dataLang;

    const dispatch = useDispatch();

    const router = useRouter();

    const showToat = useToast();

    const [isState, sIsState] = useState(initialState);

    const data = useSelector((state) => state.availableLang);

    const queryState = (key) => sIsState((pver) => ({ ...pver, ...key }));

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm();

    const phone = watch("phone");


    const valueForm = watch();

    useEffect(() => {
        setValue(
            "code",
            localStorage?.getItem("usercodeFMRP")
                ? localStorage?.getItem("usercodeFMRP")
                : ""
        );
        setValue(
            "name",
            localStorage?.getItem("usernameFMRP")
                ? localStorage?.getItem("usernameFMRP")
                : ""
        );
        router.push("/auth/register");
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
    const _HandleIsLogin = (e) => {
        queryState({ isLogin: e });
    };

    const { isLoading: isLoadingMajior } = useQuery({
        queryKey: ["api_majior"],
        queryFn: async () => {
            const res = await apiLogin.apiMajior();
            queryState({ listMajor: res?.career, listPosition: res?.role_user });
            return res;
        },
        placeholderData: keepPreviousData,
        ...optionsQuery,
    });

    const _HandleSelectStep = (e) => {
        if (isState.checkMajior) {
            queryState({ stepRegister: e });
            return;
        }
        showToat("error", "Vui lòng chọn ngành hàng của bạn");
    };

    const submitOtp = useMutation({
        mutationFn: (data) => {
            return apiLogin.apiRegister(data);
        },
        retry: 10,
        retryDelay: 5000,
    });

    const submitResendOtp = useMutation({
        mutationFn: (data) => {
            return apiLogin.apiRegister(data);
        },
        retry: 10,
        retryDelay: 5000,
    });

    const fnSetDataAuth = (value, res) => {
        const { isSuccess, message, token, database_app } = res;
        dispatch({ type: "auth/update", payload: res.data?.data });
        CookieCore.set("tokenFMRP", token, {
            expires: new Date(Date.now() + 86400 * 1000),
            sameSite: true,
        });
        CookieCore.set("databaseappFMRP", database_app, {
            expires: new Date(Date.now() + 86400 * 1000),
        });
        showToat("success", message);
        if (isState.rememberMe) {
            localStorage.setItem("usernameFMRP", value.name);
            localStorage.setItem("usercodeFMRP", value.code);
            localStorage.setItem("remembermeFMRP", isState.rememberMe);
        } else {
            ["usernameFMRP", "usercodeFMRP", "remembermeFMRP"].forEach((key) =>
                localStorage.removeItem(key)
            );
        }
        router.push("/");

        // setTimeout(() => {
        //     router.replace("/dashboard");
        // }, 2000);
    };

    const onSubmit = async (data, type) => {
        if (type == "login") {
            try {
                const res = await apiLogin.apiLoginMain({
                    data: {
                        company_code: data.code,
                        user_name: data.name,
                        password: data.password,
                    },
                });
                if (res?.isSuccess) {
                    router.replace("/dashboard");
                    fnSetDataAuth(data, res);
                    return;
                }
                showToat("error", `${res?.message || "Đăng nhập thất bại"}`);
            } catch (error) { }
        }

        if (type == "sendOtp") {
            // await handleSendOtp(data?.phone);
            setValue("otp", "");
            queryState({ checkValidateOtp: true });
            const dataSubmit = new FormData();
            dataSubmit.append("career", data?.major);
            dataSubmit.append("company_name", data?.companyName);
            dataSubmit.append("fullname", data?.fullName);
            dataSubmit.append("email", data?.email);
            dataSubmit.append("phone_number", data?.phone);
            dataSubmit.append("address", data?.city);
            dataSubmit.append("password", data?.password);
            dataSubmit.append("role_user", data?.location);
            dataSubmit.append("type", "send_otp_mail");

            const r = await submitResendOtp.mutateAsync(dataSubmit);
            if (r?.isSuccess) {
                showToat("success", r?.message);
                queryState({ isRegister: true, countOtp: 300, checkValidateOtp: true });
                return;
            }
            showToat("error", r?.message);
            queryState({ checkValidateOtp: false });
        }

        if (type == "checkOtp") {
            // await handleVeryfyOtp(data?.otp);
        }

        if (type == "register") {
            queryState({ sendOtp: true });

            const dataSubmit = new FormData();
            dataSubmit.append("is_web", 1);
            dataSubmit.append("career", data?.major);
            dataSubmit.append("company_name", data?.companyName);
            dataSubmit.append("fullname", data?.fullName);
            dataSubmit.append("email", data?.email);
            dataSubmit.append("phone_number", data?.phone);
            dataSubmit.append("address", data?.city);
            dataSubmit.append("password", data?.password);
            dataSubmit.append("role_user", data?.location);

            if (isState.isRegister) {
                dataSubmit.append("otp_code", data?.otp);
            }
            try {
                const res = await submitOtp.mutateAsync(dataSubmit);
                if (res?.isSuccess) {
                    //google ads
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: "enhanced_conversion",
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
                showToat("error", res?.message);
            } catch (error) { }
        }
    };

    return (
        <>
            <Head>
                <title>Đăng ký</title>
            </Head>
            <Script id="gtm-script" strategy="afterInteractive">
                {`
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','GTM-M7HZ95L2');
                `}
            </Script>
            <div className="grid w-screen h-screen grid-cols-5 overflow-hidden">
                <div className="col-span-2 bg-[#11315B] h-screen relative">
                    <Image
                        src="/register/img.png"
                        alt="background"
                        width={828}
                        height={1261}
                        quality={100}
                        className="object-contain w-full h-auto pointer-events-none select-none"
                        loading="lazy"
                        crossOrigin="anonymous"
                        placeholder="blur"
                        blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                    />
                    <div className="absolute bottom-[10%] left-[15%] z-[1]">
                        <Image
                            alt="logo"
                            src="/icon/logo-login.png"
                            width={200}
                            height={70}
                            unoptimized
                            quality={100}
                            className="object-contain w-auto h-[60px] select-none pointer-events-none"
                            loading="lazy"
                            crossOrigin="anonymous"
                            placeholder="blur"
                            blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                        />
                        <h2 className="text-white text-2xl font-[600] mt-8 capitalize">
                            Đăng ký tài khoản
                        </h2>
                        <h6 className="mt-3 text-white">
                            Hỗ trợ đăng ký: 0901.13.6968 - 0932.755.968
                        </h6>
                    </div>
                </div>
                <div className="h-full col-span-3 bg-white ">
                    <Customscrollbar
                        scrollableNodePropsClassName={`  ${Object.keys(errors).length === 0
                            ? "[&>div]:h-full"
                            : "[&>div]:my-3"
                            }`}
                        className="h-screen"
                    >
                        <div
                            className={`flex flex-col gap-1 items-center  h-full  ${Object.keys(errors).length === 0
                                ? "justify-center "
                                : "justify-start"
                                }`}
                        >
                            <div className="flex flex-row items-center gap-2">
                                <h1 className="text-[#11315B] font-semibold 2xl:text-xl text-[18.5px] text-center capitalize">
                                    Bước Vào Kỷ Nguyên Số Hóa Sản Xuất Cùng
                                </h1>
                                <div className="w-[80px] h-auto ">
                                    <Image
                                        src={"/LOGOLOGIN-1.png"}
                                        width={1280}
                                        height={1024}
                                        alt="@logo"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>
                            <h3 className=" text-[#667085]/70 text-[15px]">
                                {isState.stepRegister == 0
                                    ? "Bước 1/2: Lựa chọn ngành hàng của bạn"
                                    : "Bước 2/2: Nhập thông tin của bạn để đăng ký"}
                            </h3>
                            <div className="[@media(min-width:1440px)]:w-[55%] xl:w-[62%] lg:w-[70%] my-2 flex flex-col gap-2">
                                <div className="grid grid-cols-2 gap-1">
                                    <div className="w-full h-1.5 rounded-full bg-[#3276FA]" />
                                    <div className="w-full h-1.5 rounded-full bg-[#F3F4F6] relative overflow-hidden">
                                        <div
                                            className={`${isState.stepRegister == 0 ? "w-0" : "w-full"
                                                } duration-300 bg-[#3276FA] transition-[width] h-full absolute`}
                                        />
                                    </div>
                                </div>
                                {isState.stepRegister == 0 ? (
                                    <div className="grid grid-cols-3 gap-3 mt-2 2xl:gap-5 3xl:mt-5 xxl:mt-1">
                                        {isLoadingMajior ? (
                                            <>
                                                {Array.from({ length: 9 }).map((_, Register) => (
                                                    <div
                                                        key={Register}
                                                        className="h-[135px] w-full bg-slate-100 animate-pulse rounded-md"
                                                    ></div>
                                                ))}
                                            </>
                                        ) : (
                                            isState.listMajor.map((e, index) => (
                                                <label
                                                    key={e?.id?.toString()}
                                                    htmlFor={`major ${e?.id}`}
                                                    className="w-full h-full cursor-pointer  rounded-md border border-[#DDDDE2] relative"
                                                >
                                                    <div className="flex flex-col items-center justify-between w-full h-full gap-2 px-4 py-5 select-none 2xl:p-4 xxl:p-5">
                                                        <input
                                                            type="radio"
                                                            id={`major ${e?.id}`}
                                                            // {...register("major", {
                                                            //     onChange: (e) => {
                                                            //         sCheckMajior(
                                                            //             e?.target
                                                            //                 ?.checked
                                                            //         );
                                                            //     },
                                                            // })}
                                                            {...register(`major`)}
                                                            onChange={(e) => {
                                                                queryState({ checkMajior: e.target.checked });
                                                            }}
                                                            value={e?.id}
                                                            // name="major register"
                                                            className="2xl:w-5 w-4 2xl:h-5 h-4 accent-[#1847ED] peer relative z-[1]"
                                                        />
                                                        <Image
                                                            alt={e?.title}
                                                            src={e?.img}
                                                            width={44}
                                                            height={44}
                                                            quality={80}
                                                            className="w-auto 2xl:h-[48px] xl:h-[50px] h-[45px] object-contain relative z-[1]"
                                                        />
                                                        <label className="text-[#1760B9] relative z-[1] 2xl:text-base xl:text-sm [@media(min-width:1336px)]:text-[13px] text-[13px] text-center">
                                                            {e?.title}
                                                        </label>
                                                        <div className="w-full h-full peer-checked:bg-[#E2F0FE]/40 absolute top-0 left-0 transition duration-300 peer-checked:border border-[#C7DFFB] rounded-md" />
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="space-y-1">
                                            <label className="text-sm">
                                                Họ và tên của bạn
                                                <span className="p-1 text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                {...register("fullName", {
                                                    required: true,
                                                })}
                                                placeholder="Nhập họ và tên của bạn"
                                                className={`${errors.fullName
                                                    ? "border-red-500 border"
                                                    : "border-[#D0D5DD] border focus:border-[#3276FA]"
                                                    } w-full  placeholder:text-[13px] text-[13px] p-2.5 outline-none  rounded`}
                                            />
                                            {errors.fullName && (
                                                <span className="text-xs text-red-500">
                                                    Vui lòng nhập họ và tên
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm">
                                                Tên công ty
                                                <span className="p-1 text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="companyName"
                                                {...register("companyName", {
                                                    required: true,
                                                })}
                                                placeholder="Nhập tên công ty"
                                                className={`${errors.companyName
                                                    ? "border-red-500 border"
                                                    : "border-[#D0D5DD] border focus:border-[#3276FA]"
                                                    } w-full placeholder:text-[13px] text-[13px]  p-2.5 outline-none  rounded`}
                                            />
                                            {errors.fullName && (
                                                <span className="text-xs text-red-500">
                                                    Vui lòng nhập tên công ty
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid items-center grid-cols-2 space-y-1 gap-x-5 ">
                                            <div className="space-y-1 ">
                                                <label className="text-sm">
                                                    Email của bạn
                                                    <span className="p-1 text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    {...register("email", {
                                                        required: true,
                                                        pattern: {
                                                            value: /\S+@\S+\.\S+/,
                                                            message: "Nhập đúng định dạng email",
                                                        },
                                                    })}
                                                    placeholder="Nhập Email của bạn"
                                                    className={`${errors.email
                                                        ? "border-red-500 border"
                                                        : "border-[#D0D5DD] border focus:border-[#3276FA]"
                                                        } w-full  placeholder:text-[13px] text-[13px] p-2.5 outline-none  rounded`}
                                                />
                                                {errors.email && (
                                                    <span className="text-xs text-red-500" role="alert">
                                                        {errors.email.message || "Vui lòng nhập email"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm">
                                                    Số điện thoại
                                                    <span className="p-1 text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    {...register("phone", {
                                                        required: {
                                                            value: true,
                                                            message: "Vui lòng nhập số điện thoại",
                                                        },
                                                        minLength: {
                                                            value: 10,
                                                            message: "Số điện thoại tối thiểu 10 số",
                                                        },
                                                        maxLength: {
                                                            value: 11,
                                                            message: "Số điện thoại tối đa 10 số",
                                                        },
                                                        pattern: {
                                                            value: /^(0|\+84)(\d{9})$/,
                                                            message: "Số điện thoại không hợp lệ",
                                                        },
                                                    })}
                                                    placeholder="Nhập số điện thoại"
                                                    className={`${errors.phone
                                                        ? "border-red-500 border"
                                                        : "border-[#D0D5DD] border focus:border-[#3276FA] "
                                                        } w-full  placeholder:text-[13px] text-[13px] p-2.5 outline-none  rounded`}
                                                />
                                                {/* {errors.phone && errors.phone.type === "required" && (
                                                    <span className="text-xs text-red-500">
                                                        Vui lòng nhập số điện thoại
                                                    </span>
                                                )}
                                                {errors.phone && errors.phone.type === "maxLength" && (
                                                    <span className="text-xs text-red-500">Tối đa 16 số</span>
                                                )}
                                                {errors.phone && errors.phone.type === "minLength" && (
                                                    <span className="text-xs text-red-500">Tối thiểu 10 số</span>
                                                )} */}
                                                {errors.phone && (
                                                    <span className="text-xs text-red-500">
                                                        {errors.phone.message}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm">Tỉnh / Thành phố</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    {...register("city")}
                                                    placeholder="Nhập tỉnh / Thành phố"
                                                    className="w-full border placeholder:text-[13px] border-[#D0D5DD] p-2.5 outline-none focus:border-[#3276FA] rounded"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm placeholder:text-[13px]">
                                                    Mật khẩu
                                                    <span className="p-1 text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={isState.typePassword ? "text" : "password"}
                                                        name="password"
                                                        {...register("password", {
                                                            required: true,
                                                            minLength: 10,
                                                        })}
                                                        placeholder="Nhập mật khẩu"
                                                        className={`${errors.password
                                                            ? "border-red-500 border"
                                                            : "border-[#D0D5DD] border focus:border-[#3276FA] "
                                                            } w-full placeholder:text-[13px] text-[13px]  p-2.5 outline-none  rounded`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            queryState({
                                                                typePassword: !isState.typePassword,
                                                            })
                                                        }
                                                        className="absolute translate-y-1/2 -top-1 right-3"
                                                    >
                                                        {isState.typePassword ? (
                                                            <IconEyeSlash />
                                                        ) : (
                                                            <IconEye />
                                                        )}
                                                    </button>
                                                </div>
                                                {errors.password &&
                                                    errors.password.type === "required" && (
                                                        <span className="text-xs text-red-500">
                                                            Vui lòng nhập mật khẩu
                                                        </span>
                                                    )}
                                                {errors.password &&
                                                    errors.password.type === "minLength" && (
                                                        <span className="text-xs text-red-500">
                                                            Tối thiểu 10 ký tự
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm">
                                                Vị trí công việc
                                                <span className="p-1 text-red-500">*</span>
                                            </label>
                                            <div className="flex flex-wrap items-center gap-4">
                                                {isState.listPosition.map((e) => (
                                                    <div
                                                        key={e?.id?.toString()}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <input
                                                            id={`posiiton ${e?.id}`}
                                                            type="radio"
                                                            {...register("location", {
                                                                required: true,
                                                            })}
                                                            value={e?.id}
                                                            name="location"
                                                            className="accent-[#1847ED] 2xl:scale-110"
                                                        />
                                                        <label
                                                            htmlFor={`posiiton ${e?.id}`}
                                                            className={`${errors.location
                                                                ? "text-[#52575E]"
                                                                : "text-[#52575E]"
                                                                } text-sm cursor-pointer`}
                                                        >
                                                            {e?.title}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.location && (
                                                <span className="text-xs text-red-500">
                                                    Vui lòng chọn vị trí công việc
                                                </span>
                                            )}
                                        </div>
                                        {isState.isRegister && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -20 }} // Bắt đầu từ trên, mờ
                                                animate={{ opacity: 1, y: 0 }} // Hiện ra, trượt xuống
                                                exit={{ opacity: 0, y: -20 }} // Khi biến mất, trượt lên
                                                transition={{ duration: 0.2, ease: "easeOut" }} // Hiệu ứng mượt
                                                className="flex flex-col items-center gap-x-5 gap-y-2"
                                            >
                                                <div className="w-full flex flex-row justify-center items-center bg-[#E2F0FE] text-[#1760B9] rounded text-sm px-2 py-3">
                                                    <span>
                                                        Nhận mã xác thực qua Zalo :
                                                    </span>
                                                    <strong className="ml-1">
                                                        {formatPhone(phone) || "điện thoại zalo của bạn"}
                                                    </strong>
                                                </div>
                                                <div className="w-full">
                                                    <input
                                                        type="number"
                                                        placeholder="Nhập mã xác thực"
                                                        name="otp"
                                                        {...register("otp", {
                                                            required: {
                                                                value: isState.checkValidateOtp,
                                                                message: "Vui lòng nhập mã xác thực",
                                                            },
                                                            minLength: {
                                                                value: isState.checkValidateOtp ? 6 : undefined,
                                                                message:
                                                                    isState.checkValidateOtp &&
                                                                    "Mã xác thực tối thiểu 6 số",
                                                            },
                                                            maxLength: {
                                                                value: isState.checkValidateOtp ? 6 : undefined,
                                                                message:
                                                                    isState.checkValidateOtp &&
                                                                    "Mã xác thực tối đa 6 số",
                                                            },
                                                        })}
                                                        className="w-full border border-[#D0D5DD] p-2.5 outline-none focus:border-[#3276FA] rounded placeholder:text-[13px] text-[13px]"
                                                    />

                                                    {errors.otp && (
                                                        <span className="text-xs text-red-500">
                                                            {errors.otp.message}
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                                {isState.stepRegister == 0 ? (
                                    <>
                                        <button
                                            onClick={_HandleSelectStep.bind(this, 1)}
                                            className=" bg-gradient-to-l flex items-center justify-center gap-2 from-[#0375f3]  via-[#296dc1] to-[#0375f3] btn-animation hover:scale-105 w-full py-3 text-center rounded bg text-white 3xl:mt-5 xl:mt-2 2xl:mt-2 mt-5"
                                        >
                                            {/* <Building
                                                size="18"
                                                color="#ffff"
                                            /> */}
                                            <p>Tiếp Theo</p>
                                        </button>
                                        <div className="flex justify-center gap-2 mt-1">
                                            <span className="font-[300] ">Bạn đã có tài khoản?</span>
                                            <button
                                                type="button"
                                                onClick={() => router.push("/auth/login")}
                                                className="text-[#5599EC]"
                                            >
                                                Đăng nhập ngay
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-full flex justify-end ">
                                            {isState.countOtp > 0 && (
                                                <div className="mt-2 text-sm text-gray-400">
                                                    Gửi lại mã xác thực sau <strong>{isState.countOtp}</strong>  giây
                                                </div>
                                            )}
                                            {isState.isRegister && isState.countOtp <= 0 && <div
                                                onClick={() => {
                                                    queryState({ checkValidateOtp: false });
                                                    handleSubmit((data) => onSubmit(data, "sendOtp"))();
                                                }}
                                                className="mt-2 text-sm  cursor-pointer text-[#5599EC] group">
                                                {submitResendOtp.isPending ? (
                                                    <LoadingButton />
                                                ) : (
                                                    <p className="flex items-center justify-center gap-2">
                                                        <FiRefreshCcw className="w-4 h-4 transform transition-transform duration-300 group-hover:rotate-180" />{" "}
                                                        <span>Gửi lại mã xác thực</span>{" "}
                                                    </p>
                                                )}
                                            </div>}
                                        </div>

                                        <div className="flex gap-5 mt-3">
                                            {/* {isState.isRegister && (
                                                <button
                                                    onClick={() => {
                                                        queryState({ checkValidateOtp: false });
                                                        handleSubmit((data) => onSubmit(data, "sendOtp"))();
                                                    }}
                                                    disabled={
                                                        isState.countOtp > 0 || submitResendOtp.isPending
                                                    }
                                                    type="button"
                                                    className={`${isState.countOtp > 0 || submitResendOtp.isPending
                                                        ? "cursor-not-allowed"
                                                        : "cursor-pointer"
                                                        } group w-full 3xl:py-4 xxl:p-2 2xl:py-2 xl:p-2 lg:p-1 py-3 text-center rounded  bg-gradient-to-l from-[#0375f3]  via-[#296dc1] to-[#0375f3] btn-animation hover:scale-105 text-white 3xl:mt-5 xxl:mt-1  2xl:mt-2 mt-1`}
                                                >
                                                    {submitResendOtp.isPending ? (
                                                        <LoadingButton />
                                                    ) : (
                                                        <p className="flex items-center justify-center gap-2">
                                                            <FiRefreshCcw className="w-4 h-4" />{" "}
                                                            <span>Gửi lại mã xác thực</span>{" "}
                                                        </p>
                                                    )}
                                                </button>
                                            )} */}

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleSubmit((data) =>
                                                        onSubmit(
                                                            data,
                                                            isState.isRegister ? "register" : "sendOtp"
                                                        )
                                                    )();
                                                }}
                                                disabled={
                                                    submitOtp.isPending || submitResendOtp.isPending
                                                }
                                                className={`${submitOtp.isPending || submitResendOtp.isPending
                                                    ? "cursor-not-allowed"
                                                    : "cursor-pointer"
                                                    } flex items-center gap-2 justify-center w-full py-3 text-center rounded  bg-gradient-to-l from-blue-800  via-[#296dc1] to-blue-800 btn-animation hover:scale-105 text-white 3xl:mt-5 xxl:mt-1  2xl:mt-2 mt-1`}
                                            >
                                                {(
                                                    isState.isRegister
                                                        ? submitOtp.isPending
                                                        : submitResendOtp.isPending
                                                ) ? (
                                                    isState.isRegister ? (
                                                        <div>
                                                            <div className="flex items-center justify-center">
                                                                {/* <svg
                                                                                            aria-hidden="true"
                                                                                            className="w-6 h-6 mr-2 text-gray-200 animate-spin fill-white"
                                                                                            viewBox="0 0 100 101"
                                                                                            fill="none"
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                        >
                                                                                            <path
                                                                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                                                                fill="currentColor"
                                                                                            />
                                                                                            <path
                                                                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                                                                fill="currentFill"
                                                                                            />
                                                                                        </svg> */}
                                                                <LoadingButton hiddenTitle />
                                                                <h2>Khởi tạo dữ liệu ...</h2>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <LoadingButton />
                                                    )
                                                ) : (
                                                    <>
                                                        {/* <Building
                                                                size="18"
                                                                color="#ffff"
                                                            /> */}
                                                        <p className="capitalize">
                                                            {isState.isRegister ? "Xác nhận khởi tạo" : "Khởi tạo gian quản lý ngay"}
                                                        </p>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <button
                                            onClick={_HandleSelectStep.bind(this, 0)}
                                            className="w-full py-3 text-center rounded bg bg-white text-[#667085] border border-[#D0D5DD]"
                                        >
                                            Quay lại
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Customscrollbar>
                </div>
            </div>
        </>
    );
});

const BtnLang = React.memo((props) => {
    const dispatch = useDispatch();

    const _HandleShowLang = () => {
        dispatch({ type: "lang/update", payload: props.code });
        localStorage.setItem("LanguagesFMRP", props.code);
    };
    return <button onClick={_HandleShowLang.bind(this)}>{props.label}</button>;
});
export default Register;
