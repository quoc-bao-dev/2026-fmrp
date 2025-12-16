import Head from "next/head";
import React from "react";
import { ExpirredMockPreview } from "@/components/UI/expired";

// Trang tạm để xem UI banner hết hạn (mock 7 ngày dùng thử)
const ExpiredMockPage = () => {
  return (
    <>
      <Head>
        <title>Mock Expired Banner</title>
      </Head>
      <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-6">
        <div className=" w-full">
          <ExpirredMockPreview />
        </div>
      </div>
    </>
  );
};

export default ExpiredMockPage;


