import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { useMutation } from "@tanstack/react-query";
import moment from "moment";
export const useActiveStages = () => {
  const convertData = (data) => {
    return {
      ...data,
      data: {
        ...data?.data,
        items: data?.data?.items.map((e) => {
          
          // làm tròn xuống
          const InterQuantityEnter = Math.floor(e?.quantity_enter);
          return {
            ...e,
            quantityError: 0,
            quantityEnterClient: e?.quantity_enter,
            serial: [...Array(InterQuantityEnter)].map((_, index) => {
              const serialNumber = (e?.max_serial_number + index + 1)
                .toString()
                .padStart(2, "0"); // 🔹 Format thành "01", "02", ...
              return {
                value: `${e?.ref}-${serialNumber}`,
                isDuplicate: false,
              };
            }),
            serialError: [],
            lot: e?.lot,
            date: e?.date_use ? moment(e?.date_use).toDate() : null,
          };
        }),
      },
    };
  };

  const getListActiveStages = useMutation({
    mutationFn: async (data) => {
      const r = await apiProductionsOrders.apiActiveStages(data);
      return convertData(r);
    },
  });

  const onGetData = async (data) => {
    const formData = new FormData();

    formData.append("po_id", data?.id ?? "");
    formData.append("is_product", data?.is_product ?? "");
    formData.append("stage_id", data?.stage_id ?? "");

    const r = await getListActiveStages.mutateAsync(formData);

    return convertData(r);
  };

  return {
    onGetData,
    data: getListActiveStages.data,
    isLoading: getListActiveStages.isPending,
  };
};
