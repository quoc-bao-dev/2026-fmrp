import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom'
import { EmptyExprired } from '@/components/UI/common/EmptyExprired'
import { Container } from '@/components/UI/common/layout'
import Head from 'next/head'
import React from 'react'
import LeftContent from './LeftContent'
import RightContent from './RightContent'

const LayoutForm = ({
  title,
  heading,
  breadcrumbItems,
  statusExprired,
  dataLang,
  onSave,
  onExit,
  loading,
  leftContent,
  rightContent,
  info,
  total,
  infoTitle = 'Thông tin',
  totalTitle = 'Tổng cộng',
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col gap-5">
      <Head>
        <title>{title}</title>
      </Head>

      <Container className="flex flex-col gap-5 flex-1 overflow-auto !space-y-0 xl:px-6 2xl:px-12 3xl:px-12">
        <div className="flex flex-col gap-1">
          {statusExprired ? <EmptyExprired /> : <Breadcrumb items={breadcrumbItems} className="responsive-text-sm" />}
          <h2 className="text-lg xl:text-2xl 2xl:text-[28px]/[40px] text-gray-800 font-medium">{heading}</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 2xl:gap-6 h-fit">
          <LeftContent>{leftContent}</LeftContent>
          <RightContent>
            {info && (
              <div className="bg-white px-4 py-6 flex flex-col gap-4 rounded-2xl border border-[#919EAB3D]">
                <h2 className="responsive-text-xl font-medium text-brand-color">{infoTitle}</h2>
                {info}
              </div>
            )}
            {total && (
              <div className="bg-white px-4 py-6 flex flex-col gap-4 rounded-2xl border border-[#919EAB3D]">
                <h2 className="responsive-text-xl font-medium text-brand-color">{totalTitle}</h2>
                {total}
              </div>
            )}
            {rightContent}
          </RightContent>
        </div>
      </Container>
      {/* Footer Actions */}
      <div className="sticky bottom-0 left-0 z-50 w-full bg-white border-t border-gray-200 shadow-[0_-3px_12px_0px_#0000001A]">
        <div className="py-2.5 2xl:py-3 px-4 xl:px-6 2xl:px-12 3xl:px-12 flex items-center justify-end gap-2">
          <button
            onClick={onExit}
            className="px-6 py-2 2xl:py-3 responsive-text-base bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Thoát
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-6 py-2 2xl:py-3 responsive-text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LayoutForm
