import { motion } from 'framer-motion';
import Image from 'next/image';

const TYPE_CONTENT = {
  noti: {
    image: '/nodata/nodata-noti.png',
    title: 'Không có thông báo',
    titleClassName: 'text-[#141522] opacity-90',
  },
  dashboard: {
    image: '/nodata/task.svg',
    title: 'Chưa có dữ liệu tổng quan',
    titleClassName: 'text-[#141522] opacity-90',
  },
  table: {
    image: '/nodata/nodata-table-2.png',
    title: 'Chưa có dữ liệu',
    titleClassName: '3xl:text-2xl xl:text-base text-lg text-[#52575E]',
  },
  comment: {
    image: '/nodata/message_empty.svg',
    title: 'Hãy thảo luận trao đổi tình hình sản xuất ngay!',
    titleClassName: 'text-[#141522] opacity-90',
  },
  report: {
    image: '/nodata/data-not-found.png',
    title: 'Chưa có dữ liệu báo cáo',
    titleClassName: 'text-[#141522] opacity-90',
  },
  default: {
    image: '/icon/nodata_ok.svg',
    title: 'Không tìm thấy các mục',
    titleClassName: 'text-[#141522] opacity-90',
  },
};

const NoData = ({
  type = 'table',
  className = '',
  classNameImage = '3xl:max-w-[280px] max-w-[200px] w-full h-auto object-contain',
  classNameTitle = 'text-sm',
  titleText = '',
  ...rest
}) => {
  const { image, title, titleClassName } = TYPE_CONTENT[type] || TYPE_CONTENT.default;
  const finalTitle = titleText || title;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className={`w-full h-full flex items-center justify-center ${className}`}
      {...rest}
    >
      <div className='h-full flex flex-col justify-center items-center 3xl:gap-5 gap-3 3xl:py-5 py-3 mx-auto text-center'>
        <Image src={image} width={1000} height={1000} alt='nodata' className={classNameImage} priority />
        {finalTitle && (
          <h3 className={`${titleClassName} ${classNameTitle} font-medium`}>
            {finalTitle}
          </h3>
        )}
      </div>
    </motion.div>
  );
};

export default NoData;
