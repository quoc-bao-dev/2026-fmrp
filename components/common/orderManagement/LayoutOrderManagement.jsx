import OrderFormTabs from '@/components/common/orderManagement/OrderFormTabs'
import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom'
import { EmptyExprired } from '@/components/UI/common/EmptyExprired'
import { Container } from '@/components/UI/common/layout'
import useSetingServer from '@/hooks/useConfigNumber'
import useStatusExprired from '@/hooks/useStatusExprired'
import formatMoneyConfig from '@/utils/helpers/formatMoney'
import { Button } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'

const LayoutOrderManagement = ({
  dataLang,
  titleHead,
  breadcrumbItems,
  titleLayout,
  searchBar,
  tableLeft,
  info,
  note,
  isTotalMoney,
  routerBack = '/',
  onSave,
  onSending = false,
  popupConfim,
}) => {
  const router = useRouter()
  const statusExprired = useStatusExprired()
  const dataSeting = useSetingServer()

  const formatMoney = (number) => {
    return formatMoneyConfig(+number, dataSeting)
  }

  return (
    <div className="overflow-hidden">
      <Head>
        <title>{titleHead}</title>
      </Head>
      <Container className="!h-max py-6 bg-gray-color">
        {statusExprired ? (
          <EmptyExprired />
        ) : (
          <Breadcrumb items={breadcrumbItems} className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]" />
        )}

        <h2 className="3xl:text-2xl 2xl:text-xl xl:text-lg text-typo-gray-5 capitalize font-medium mt-1 2xl:!mb-5 lg:!mb-3">
          {titleLayout}
        </h2>
        <div className="flex w-full 3xl:gap-x-6 gap-x-4 items-stretch pb-20 relative">
          {/* Cột trái */}
          <div className="w-3/4">
            <div className="min-h-full max-h-[1132px] flex flex-col gap-y-6 bg-white border border-[#919EAB3D] rounded-2xl p-4">
              {/* Thông tin mặt hàng */}
              <div className="flex justify-between items-center">
                {/* Heading */}
                <h2 className="w-full 2xl:text-[20px] xl:text-lg font-medium text-brand-color capitalize">
                  {dataLang?.item_information || 'item_information'}
                </h2>
                {searchBar}
              </div>
              {tableLeft}
            </div>
          </div>

          {/* Cột phải */}
          <div className="w-1/4">
            <div className="flex flex-col gap-y-6">
              {/* Cột thông tin chung */}
              <div className="w-full mx-auto px-4 bg-white border border-gray-200 rounded-2xl py-6">
                <h2 className="2xl:text-[20px] xl:text-lg font-medium text-brand-color mb-4 capitalize">Thông tin</h2>
                {/* Tabs */}
                <OrderFormTabs info={info} note={note} />
              </div>
              <div className="w-full mx-auto px-4 pt-6 pb-4 bg-white border border-gray-200 rounded-2xl">
                <h2 className="2xl:text-[20px] xl:text-lg font-medium text-brand-color mb-6 capitalize">
                  {'Tổng cộng' || dataLang?.price_quote_total}
                </h2>
                {/* Tổng tiền */}
                <div className="flex justify-between items-center mb-4 responsive-text-base font-normal text-black-color">
                  <h4 className="w-full">{dataLang?.price_quote_total || 'price_quote_total'}</h4>
                  <span>{isTotalMoney?.totalPrice != null ? formatMoney(isTotalMoney.totalPrice) : '-'}</span>
                </div>
                {/* Tiền chiết khấu */}
                <div className="flex justify-between items-center mb-4 responsive-text-base font-normal text-secondary-color-text">
                  <h4 className="w-full">{dataLang?.sales_product_discount || 'sales_product_discount'}</h4>
                  <span>
                    {isTotalMoney?.totalDiscountPrice != null ? formatMoney(isTotalMoney.totalDiscountPrice) : '-'}
                  </span>
                </div>
                {/* Tiền sau chiết khấu */}
                <div className="flex justify-between items-center mb-4 responsive-text-base font-normal text-secondary-color-text">
                  <h4 className="w-full">
                    {dataLang?.sales_product_total_money_after_discount || 'sales_product_total_money_after_discount'}
                  </h4>
                  <span>
                    {isTotalMoney?.totalDiscountAfterPrice != null
                      ? formatMoney(isTotalMoney.totalDiscountAfterPrice)
                      : '-'}
                  </span>
                </div>
                {/* Tiền thuế */}
                <div className="flex justify-between items-center mb-4 responsive-text-base font-normal text-secondary-color-text">
                  <h4 className="w-full">{dataLang?.sales_product_total_tax || 'sales_product_total_tax'}</h4>
                  <span>{isTotalMoney?.totalTax != null ? formatMoney(isTotalMoney.totalTax) : '-'}</span>
                </div>
                {/* Thành tiền */}
                <div className="flex justify-between responsive-text-base items-center mb-4">
                  <h4 className="w-full text-black font-semibold">
                    {dataLang?.sales_product_total_into_money || 'sales_product_total_into_money'}
                  </h4>
                  <span className="text-blue-color font-semibold">
                    {isTotalMoney?.totalAmount != null ? formatMoney(isTotalMoney.totalAmount) : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nút lưu và thoát */}
        <div className="fixed bottom-0 left-0 z-[999] w-full h-[68px] bg-white border-t border-gray-color flex gap-x-6 shadow-[0_-3px_12px_0_rgba(0,0,0,0.1)]">
          <div className="w-3/4"></div>
          <div className="w-1/4 flex justify-end items-center gap-2 py-4 3xl:px-5 px-3">
            <button
              onClick={() => router.push(routerBack)}
              dataLang={dataLang}
              className="2xl:px-5 2xl:pt-[10px] 2xl:pb-[30px] xl:px-4 xl:py-2 px-2 h-full bg-[#F2F3F5] 2xl:text-base text-sm font-normal rounded-lg"
            >
              Thoát
            </button>
            <Button
              onClick={onSave}
              dataLang={dataLang}
              loading={onSending}
              className="sale-order-btn-submit 3xl:p-5 2xl:p-4 xl:pt-[10px] xl:pb-[10px] h-full bg-light-blue-color text-white 2xl:text-base xl:text-sm font-medium rounded-lg"
            >
              Lưu
            </Button>
          </div>
        </div>
      </Container>

      {popupConfim}
    </div>
  )
}

export default LayoutOrderManagement
