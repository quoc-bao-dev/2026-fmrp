import Image from 'next/image'

const EmptyData = () => {
  return (
    <div className="w-full min-h-[78vh] flex flex-col justify-center items-center select-none">
      <Image
        src={'/data-not-found.png'}
        alt="No Data"
        width={400}
        height={400}
        quality={100}
        className="3xl:w-[300px] 2xl:w-[200px] w-[175px] h-auto object-contain"
        loading="lazy"
        crossOrigin="anonymous"
      ></Image>
      <p className="text-sm font-normal mt-2">Chưa có mặt hàng. Bắt đầu thêm mặt hàng tại khung tìm kiếm ngay!</p>
    </div>
  )
}

export default EmptyData
