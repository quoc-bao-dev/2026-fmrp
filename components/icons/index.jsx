/**
 * HƯỚNG DẪN SỬ DỤNG:
 * 
 * 1. Tạo svg icon với tên là name.svg
 * 
 * 2. Vào sửa svg: 
 *   - Xóa width, height để có thể set w h bằng tailwind
 *   - Sửa fill = "currentColor" để có thể thay đổi màu bằng tailwind
 * 
 * 3. Vào file index.jsx:
 *   - Import icon:
 *     import SearchIcon from './search.svg';
 *   - Export icon:
 *     export { SearchIcon };
 * 
 * 4. Sử dụng trong component:
 *    <SearchIcon className="w-5 h-5 text-blue-500" />
 *    <PlusIcon className="w-6 h-6" />
 * 
 * LƯU Ý:
 * - Vào component/icons để xem icon đã có hay chưa rồi mới thêm mới
 * - Sử dụng className để thay đổi kích thước, màu sắc
 * - Icon được import thông qua @svgr/webpack, tự động chuyển thành React component
 */

import ArrowBendUpRightIcon from './arrow-bend-up-right.svg';
import ArrowCounterClockWiseIcon from './arrow-counter-clock-wise.svg';
import ArrowDownIcon from './arrow-down.svg';
import ArrowRightIcon from './arrow-right.svg';
import ArrowUpIcon from './arrow-up.svg';
import BackIcon from './back.svg';
import CalendarIcon from './calendar.svg';
import CaretDownIcon from './caret-down.svg';
import CaretDropDownThinIcon from './caret-drop-down-thin.svg';
import ChartDonutIcon from './chart-donut.svg';
import ChatIcon from './chat.svg';
import CheckCircleOutlineIcon from './check-circle-outline.svg';
import CheckCircleIcon from './check-circle.svg';
import CheckThinIconAlt from './check-thin.svg';
import CheckIcon from './check.svg';
import CloseXIcon from './close-x.svg';
import CompleteKHIcon from './complete-k-h.svg';
import DocumentTemplateIcon from './document-template-icon.svg';
import DownloadIcon from './download-icon.svg';
import DropdownFilledIcon from './dropdown-filled-icon.svg';
import DropdownIcon from './dropdown-icon.svg';
import EditIcon from './edit.svg';
import ErrorAlertIcon from './error-alert-icon.svg';
import ErrorChatBotIcon from './error-chat-bot.svg';
import ErrorIconMessengerIcon from './error-icon-messenger.svg';
import ErrorQCIcon from './error-q-c.svg';
import ExcelIcon from './excel.svg';
import ExportMaterialsIcon from './export-materials-icon.svg';
import FileIcon from './file-icon.svg';
import FunnelIcon from './funnel.svg';
import IconStarIcon from './icon-star.svg';
import KanbanIcon from './kanban-icon.svg';
import LateLSXIcon from './late-l-s-x.svg';
import ListChecksIcon from './list-checks-icon.svg';
import LoadingDataChatBotIcon from './loading-data-chat-bot.svg';
import MagnifyingGlassIcon from './magnifying-glass-icon.svg';
import MobileIcon from './mobile-icon.svg';
import NoteIcon from './note-icon.svg';
import PasswordIcon from './password-icon.svg';
import PlusIcon from './plus.svg';
import PrintTemplateIcon from './print-template-icon.svg';
import PrinterIcon from './printer-icon.svg';
import PrinterIcon2 from './printer-icon2.svg';
import PrinterTemIcon from './printer-tem.svg';
import RefreshIcon from './refresh.svg';
import SealCheckIcon from './seal-check.svg';
import SaleIcon from './sale-icon.svg';
import SaveIcon from './save-icon.svg';
import SearchIcon from './search.svg';
import SendMessengerIcon from './send-messenger-icon.svg';
import SignOutIcon from './sign-out-icon.svg';
import SparkleIcon from './sparkle-icon.svg';
import SparkleOutlineIcon from './sparkle-outline-icon.svg';
import StickerIcon from './sticker-icon.svg';
import SuccessAlertIcon from './success-alert-icon.svg';
import SuccessChatIcon from './success-chat-icon.svg';
import TemplateChecklistIcon from './template-checklist-icon.svg';
import TrashIcon from './trash.svg';
import UpgradeIcon from './upgrade-icon.svg';
import UserCircleIcon from './user-circle-icon.svg';
import WarningAlertIcon from './warning-alert-icon.svg';
import WarningIcon from './warning-icon.svg';

// Export tất cả các icon
export { 
  SearchIcon,
  SealCheckIcon,
  ArrowBendUpRightIcon,
  ArrowCounterClockWiseIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BackIcon,
  CalendarIcon,
  CaretDownIcon,
  CaretDropDownThinIcon,
  ChartDonutIcon,
  ChatIcon,
  CheckCircleOutlineIcon,
  CheckCircleIcon,
  CheckThinIconAlt,
  CheckIcon,
  CloseXIcon,
  CompleteKHIcon,
  DocumentTemplateIcon,
  DownloadIcon,
  DropdownFilledIcon,
  DropdownIcon,
  EditIcon,
  ErrorAlertIcon,
  ErrorChatBotIcon,
  ErrorIconMessengerIcon,
  ErrorQCIcon,
  ExcelIcon,
  ExportMaterialsIcon,
  FileIcon,
  FunnelIcon,
  IconStarIcon,
  KanbanIcon,
  LateLSXIcon,
  ListChecksIcon,
  LoadingDataChatBotIcon,
  MagnifyingGlassIcon,
  MobileIcon,
  NoteIcon,
  PasswordIcon,
  PlusIcon,
  PrintTemplateIcon,
  PrinterIcon,
  PrinterIcon2,
  PrinterTemIcon,
  RefreshIcon,
  SaleIcon,
  SaveIcon,
  SendMessengerIcon,
  SignOutIcon,
  SparkleIcon,
  SparkleOutlineIcon,
  StickerIcon,
  SuccessAlertIcon,
  SuccessChatIcon,
  TemplateChecklistIcon,
  TrashIcon,
  UpgradeIcon,
  UserCircleIcon,
  WarningAlertIcon,
  WarningIcon,
};
