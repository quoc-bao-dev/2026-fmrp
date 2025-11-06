import React from 'react';
import { Container, ContainerBody } from '@/components/UI/common/layout';
import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { ListBtn_Setting } from '../information';
import useStatusExprired from '@/hooks/useStatusExprired';
import { useSelector } from 'react-redux';

/**
 * SettingLayout Component
 *
 * Layout component chung cho tất cả các trang settings
 * Tự động render sidebar với ListBtn_Setting và version info
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Nội dung hiển thị trong content body (col-span-7)
 * @param {Object} props.dataLang - Object chứa các text đa ngôn ngữ (required)
 * @param {React.ReactNode} [props.breadcrumb] - Breadcrumb tùy chọn, nếu không có sẽ hiển thị EmptyExprired khi expired
 * @param {string} [props.className] - Class name tùy chọn cho Container
 * @param {string} [props.containerBodyClassName] - Class name tùy chọn cho ContainerBody
 *
 * @example
 * // Ví dụ sử dụng cơ bản
 * const MySettingsPage = (props) => {
 *   const dataLang = props.dataLang;
 *
 *   return (
 *     <SettingLayout
 *       dataLang={dataLang}
 *       breadcrumb={
 *         <>
 *           <h6 className='text-[#141522]/40'>{dataLang?.branch_seting}</h6>
 *           <span className='text-[#141522]/40'>/</span>
 *           <h6>Tiêu đề trang</h6>
 *         </>
 *       }
 *     >
 *       <div className='space-y-7 h-[96%] overflow-hidden'>
 *         <h2 className='text-2xl text-[#52575E]'>Tiêu đề nội dung</h2>
 *         {/* Nội dung trang của bạn *\/}
 *       </div>
 *     </SettingLayout>
 *   );
 * };
 *
 * @example
 * // Ví dụ với custom className cho ContainerBody
 * <SettingLayout
 *   dataLang={dataLang}
 *   containerBodyClassName="h-[100%] flex flex-col justify-between overflow-hidden"
 * >
 *   <div>Content here</div>
 * </SettingLayout>
 */
const SettingLayout = ({ children, dataLang, breadcrumb, className, containerBodyClassName }) => {
  const statusExprired = useStatusExprired();
  const dataSetting = useSelector(state => state.setings);

  return (
    <Container className={className}>
      {statusExprired ? <EmptyExprired /> : breadcrumb && <div className='flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]'>{breadcrumb}</div>}
      <div className='grid grid-cols-9 gap-5 h-[99%]'>
        {/* Sidebar */}
        <div className='col-span-2 sticky'>
          <div className='h-fit p-5 rounded bg-[#E2F0FE] space-y-3 mb-3'>
            <ListBtn_Setting dataLang={dataLang} />
          </div>
          <p className='w-full text-center text-[#667085] font-normal text-sm'>Phiên bản V{dataSetting?.versions}</p>
        </div>

        {/* Content Body */}
        <ContainerBody className={`col-span-7 ${containerBodyClassName || ''}`}>{children}</ContainerBody>
      </div>
    </Container>
  );
};

export default SettingLayout;
