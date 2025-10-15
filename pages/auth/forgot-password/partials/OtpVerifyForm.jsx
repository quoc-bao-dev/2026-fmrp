import React, { useState } from "react";
import OtpInput from "./OtpInput";

/*
  OtpVerifyForm
  Props:
    - phone: string (hiển thị trong subtitle)
    - length?: number (mặc định 6)
    - onSubmit?: (code: string) => Promise<void> | void
*/
const OtpVerifyForm = ({ phone = "", length = 6, onSubmit }) => {
  const [code, setCode] = useState("");

  const handleComplete = (value) => {
    setCode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (typeof onSubmit === "function") await onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 mt-10">
      <div className="text-center">
        <h1 className="text-[#11315B] font-medium text-3xl capitalize">
          Nhập Mã OTP
        </h1>
        <p className="text-[#667085] font-light mt-2">
          Nhập mã xác thực OTP được gửi đến{" "}
          <span className="font-semibold text-[#344054]">{phone}</span>
        </p>
      </div>
      <div className="w-full flex justify-center pt-6">
        <OtpInput length={length} onComplete={handleComplete} />
      </div>
      <button
        type="submit"
        disabled={code.length !== length}
        className="text-[#FFFFFF] font-normal text-lg py-3 w-full rounded-md bg-gradient-to-l from-[#0375f3]  via-[#296dc1] to-[#0375f3] btn-animation hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Xác nhận
      </button>
    </form>
  );
};

export default OtpVerifyForm;
