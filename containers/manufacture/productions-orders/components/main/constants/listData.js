import ExportMaterialsIcon from '@/components/icons/common/ExportMaterialsIcon'
import KanbanIcon from '@/components/icons/common/KanbanIcon'
import ListChecksIcon from '@/components/icons/common/ListChecksIcon'

// export const listTab = [
//   {
//     id: uddid(),
//     name: dataLang?.import_finished_product || 'import_finished_product',
//     type: 'products',
//   },
//   {
//     id: uddid(),
//     name: dataLang?.materials_planning_semi || 'materials_planning_semi',
//     type: 'semiProduct',
//   },
// ]


export const listLsxTab = [
  {
    id: '2323',
    name: 'Thông tin',
    count: null,
    type: 'products',
  },
  {
    id: '43434',
    name: 'Kế hoạch BTP & NVL',
    count: 0,
    type: 'semiProduct',
  },
  {
    id: '3',
    name: 'Giữ kho & Mua hàng',
    count: 0,
    type: 'keepStock',
  },
]

export const listLsxStatus = [
  {
    label: 'Chưa sản xuất',
    value: '0',
    color: 'bg-[#FF811A]/15 text-[#C25705]',
  },
  {
    label: 'Đang sản xuất',
    value: '1',
    color: 'bg-[#3ECeF7]/20 text-[#076A94]',
  },
  {
    label: 'Hoàn thành',
    value: '2',
    color: 'bg-[#35BD4B]/20 text-[#1A7526]',
  },
]

export const listDropdownCompleteStage = [
  {
    id: 1,
    label: 'Xuất kho nguyên liệu',
    icon: <ExportMaterialsIcon className="size-full" />,
    isPremium: true,
    type: 'export_materials',
  },
  {
    id: 2,
    label: 'Hoàn thành tổng lệnh',
    icon: <ListChecksIcon className="size-full" />, // bạn thay bằng icon tương ứng
    isPremium: false,
    type: 'normal',
  },
  {
    id: 3,
    label: 'Hoàn thành chi tiết công đoạn',
    icon: <KanbanIcon className="size-full" />,
    isPremium: true,
    type: 'complete_stage',
  },
]
