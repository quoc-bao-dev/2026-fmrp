import CalendarDropdown, {
  timeRanges,
} from "@/components/common/dropdown/CalendarDropdown";
import Loading from "@/components/UI/loading/loading";
import { useGetTopProducedProducts } from "@/hooks/dashboard/useGetTopProducedProducts";
import { getDateRangeFromValue } from "@/utils/helpers/getDateRange";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const CardProduct = ({ name, quantity, percentageChange, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className={`w-full h-full flex items-center justify-center ${className}`}
    >
      <div className="flex-1 rounded-2xl p-6 flex justify-between items-start shadow-[0px_12px_24px_-4px_rgba(145,158,171,0.12),0px_0px_2px_0px_rgba(145,158,171,0.20)]">
        <div className="flex flex-col">
          <h3 className="text-3xl font-bold text-blue-fmrp">{quantity?.toLocaleString()}</h3>
          <p className="text-sm font-normal text-typo-black-1">{name}</p>
        </div>
        {percentageChange !== undefined && percentageChange !== 0 && (
          <div className="flex items-center gap-1">
            <Image
              src={
                percentageChange >= 0
                  ? "/dashboard/upGreen.svg"
                  : "/dashboard/downRed.svg"
              }
              alt={percentageChange >= 0 ? "upGreen" : "downRed"}
              width={24}
              height={24}
            />
            <p className="text-sm font-medium text-typo-gray-3">
              {Math.abs(percentageChange)}%
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const NoDataTopProduct = () => {
  const topProductsNoData = [
    {
      id: 1,
      name: "Chưa có mặt hàng ",
      quantity: 0,
      percentageChange: undefined,
    },
    {
      id: 2,
      name: "Chưa có mặt hàng ",
      quantity: 0,
      percentageChange: undefined,
    },
    {
      id: 3,
      name: "Chưa có mặt hàng ",
      quantity: 0,
      percentageChange: undefined,
    },
    {
      id: 4,
      name: "Chưa có mặt hàng ",
      quantity: 0,
      percentageChange: undefined,
    },
    {
      id: 5,
      name: "Chưa có mặt hàng ",
      quantity: 0,
      percentageChange: undefined,
    },
  ];

  return (
    <>
      {topProductsNoData.map((product) => (
        <CardProduct
          key={product.id}
          name={product.name}
          quantity={product.quantity}
          percentageChange={product.percentageChange}
        />
      ))}
    </>
  );
};

const TopProducts = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [date, setDate] = useState(timeRanges[4]);
  const { data, isLoading } = useGetTopProducedProducts({
    dateEnd: dateEnd,
    dateStart: dateStart,
  });

  useEffect(() => {
    if (date) {
      const range = getDateRangeFromValue(date.value);
      setDateStart(range ? range.startDate : "");
      setDateEnd(range ? range.endDate : "");
    }
  }, [date]);

  useEffect(() => {
    if (!isLoading && data) setTopProducts(data?.items);
  }, [isLoading, data]);

  return (
    <div className="px-4 md:px-8 lg:px-12 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <h2 className="capitalize text-lg font-medium text-typo-black-1">
          Top sản phẩm sản xuất nhiều nhất
        </h2>
        <CalendarDropdown setState={setDate} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-6">
        {isLoading ? (
          <Loading className="h-80" color="#0f4f9e" />
        ) : data && topProducts.length > 0 ? (
          <>
            {topProducts.map((product, index) => (
              <CardProduct
                key={index}
                name={product.item_name}
                quantity={product.quantity}
                percentageChange={product.percent_quantity}
              />
            ))}
          </>
        ) : (
          <NoDataTopProduct />
        )}
      </div>
    </div>
  );
};

export default TopProducts;
