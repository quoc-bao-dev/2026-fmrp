import React from "react";
import OtpVerifyForm from "./OtpVerifyForm";
import { useRouter } from "next/router";

/**
 * OTP Verification component
 * @description Second step of forgot password flow for OTP verification
 * @returns {JSX.Element} Rendered OTP verification step
 * @example
 * // Basic usage - phone number passed via URL query
 * <Otp />
 */
const Otp = () => {
  const router = useRouter();
  const phone = router.query.phone || "";

  const onSubmit = async (code) => {
    // verify OTP with API here if needed
  };

  return <OtpVerifyForm phone={phone} length={6} onSubmit={onSubmit} />;
};

export default Otp;
