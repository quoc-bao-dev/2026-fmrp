'use client'
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";

const AuthLayout = React.memo(({ children, title = "Auth" }) => {
    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <div className="bg-[#EEF1F8]">
                <div className="bg-[url('/Logo-BG.png')] relative bg-repeat-round h-screen w-screen flex flex-col justify-center items-center overflow-hidden">
                    <div className="z-10 flex justify-center w-full space-x-20">
                        <div className="">
                            <div className="bg-white px-16 py-8 flex flex-col gap-6 rounded-lg w-[600px]">
                                {children}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="pointer-events-none select-none">
                                <Image
                                    alt=""
                                    width={200}
                                    src="/LOGOLOGIN-1.png"
                                    height={70}
                                    quality={100}
                                    className="object-contain"
                                    loading="lazy"
                                    crossOrigin="anonymous"
                                    placeholder="blur"
                                    blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                                />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-[#344054] font-medium text-[19px] capitalize">Trợ lý sản xuất</h1>
                                <div className="space-y-1">
                                    <p className="text-[#344054] font-normal text-xl flex items-center">
                                        <FaQuoteLeft className="w-3 h-3 text-[#344054]" />
                                        <span className="mx-2">Tối ưu sản xuất, tối đa năng suất, tối thiểu lãng phí</span>
                                        <FaQuoteRight className="w-3 h-3 text-[#344054]" />
                                    </p>
                                    <p className="text-[#667085] font-light text-[16px]">
                                        Hotline:
                                        <span className="text-[#0F4F9E] font-normal ml-1">0901.13.6968 - 0932.755.968</span>
                                    </p>
                                </div>
                            </div>
                            <div className="pointer-events-none select-none">
                                <Image
                                    alt=""
                                    src="/qr.png"
                                    width={120}
                                    height={120}
                                    quality={100}
                                    className="object-contain w-auto h-auto "
                                    loading="lazy"
                                    crossOrigin="anonymous"
                                    placeholder="blur"
                                    blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                                />
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 pointer-events-none select-none">
                        <Image
                            src="/bgImageLogin.png"
                            alt=""
                            width={500}
                            height={500}
                            quality={100}
                            className="object-contain w-[600px] h-auto"
                            loading="lazy"
                            crossOrigin="anonymous"
                            placeholder="blur"
                            blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                        />
                    </div>
                </div>
            </div>
        </>
    );
});

export default AuthLayout;


