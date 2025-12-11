import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import Image from 'next/image';

const ProductSelectionSidebar = ({ products, selectedProducts, selectAll, onSelectAll, onSelectProduct, getProductId, isLoading }) => {
  return (
    <div className='w-[280px] flex flex-col rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden'>
      <div className='p-3 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]'>
        <h2 className='text-sm font-semibold text-[#141522]'>Chọn thành phẩm để xuất kho</h2>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-full min-h-[300px]'>
          <Loading />
        </div>
      ) : products.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-full min-h-[300px] gap-3 p-4'>
          <NoData type='report' titleText='Không có thành phẩm nào' />
        </div>
      ) : (
        <Customscrollbar className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
          <div className='p-2'>
            <div className='flex items-center gap-2 mb-2'>
              <CheckboxDefault checked={selectAll} onChange={onSelectAll} label='Chọn tất cả' />
            </div>
            {products.map(product => {
              const productId = getProductId(product);
              const isSelected = selectedProducts.includes(productId);

              return (
                <div
                  key={productId}
                  className={`p-2 rounded-md mb-2 cursor-pointer transition-all duration-200 ${
                    isSelected ? 'bg-gradient-to-br from-[#EBF5FF] to-[#D0E8FF] shadow-md shadow-blue-100/50' : 'bg-white hover:bg-[#F9FAFB] hover:shadow-sm'
                  }`}
                  onClick={() => onSelectProduct(productId, !isSelected)}
                >
                  <div className='flex items-center gap-2'>
                    <div onClick={e => e.stopPropagation()}>
                      <CheckboxDefault checked={isSelected} className='!space-x-0' onChange={checked => onSelectProduct(productId, checked)} />
                    </div>
                    <div className='w-12 h-12 rounded flex items-center justify-center flex-shrink-0'>
                      <Image src={product.images || '/icon/default/default.png'} alt={product.item_name || 'default'} width={48} height={48} className='object-cover rounded' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-sm font-semibold text-[#141522] truncate'>{product.item_name}</h4>
                      {product.reference_no_detail && <p className='text-xs text-new-blue font-medium'>{product.reference_no_detail}</p>}
                      <p className='text-xs text-[#667085] truncate'>{product.item_code}</p>
                      {product.product_variation && <p className='text-[10px] font-normal text-[#667085] truncate mt-0.5'>{product.product_variation}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Customscrollbar>
      )}
    </div>
  );
};

export default ProductSelectionSidebar;

