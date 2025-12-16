import Head from "next/head";
import React from "react";
import { PopupAppRenewalMockPreview } from "@/components/UI/popup/PopupAppRenewal";

// Trang tạm để xem UI popup gia hạn (mock)
const PopupAppRenewalMockPage = () => {
  return (
    <>
      <Head>
        <title>Mock Popup Gia Hạn Phần Mềm</title>
      </Head>
      <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          <PopupAppRenewalMockPreview />
        </div>
      </div>
    </>
  );
};

export default PopupAppRenewalMockPage;
