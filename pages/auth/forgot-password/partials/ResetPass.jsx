import React from "react";
import ResetPassForm from "./ResetPassForm";
import { useRouter } from "next/router";

/**
 * Reset Password component
 * @description Final step of forgot password flow for setting new password
 * @returns {JSX.Element} Rendered reset password step
 * @example
 * // Basic usage - company info passed via URL query
 * <ResetPass />
 */
const ResetPass = () => {
  const router = useRouter();
  const companyCode = (router.query.companyCode || "XYZ").toString();
  const companyName = (router.query.companyName || "FOSO").toString();

  const onSubmit = async ({ newPassword, confirmPassword, remember }) => {
    // call reset password API here if needed
  };

  return (
    <ResetPassForm
      companyCode={companyCode}
      companyName={companyName}
      onSubmit={onSubmit}
    />
  );
};

export default ResetPass;
