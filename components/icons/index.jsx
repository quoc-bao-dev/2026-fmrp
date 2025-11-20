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
 * - Vào component/source/icons để xem icon đã có hay chưa rồi mới thêm mới
 * - Sử dụng className để thay đổi kích thước, màu sắc
 * - Icon được import thông qua @svgr/webpack, tự động chuyển thành React component
 */

import ArrowBendUpRightIcon from './source/arrow-bend-up-right.svg';
import ArrowCounterClockWiseIcon from './source/arrow-counter-clock-wise.svg';
import ArrowDownIcon from './source/arrow-down.svg';
import ArrowRightIcon from './source/arrow-right.svg';
import ArrowUpIcon from './source/arrow-up.svg';
import BackIcon from './source/back.svg';
import CalendarIcon from './source/calendar.svg';
import CaretDownIcon from './source/caret-down.svg';
import CaretDropDownThinIcon from './source/caret-drop-down-thin.svg';
import ChartDonutIcon from './source/chart-donut.svg';
import ChatIcon from './source/chat.svg';
import CheckCircleOutlineIcon from './source/check-circle-outline.svg';
import CheckCircleIcon from './source/check-circle.svg';
import CheckThinIcon from './source/check-thin.svg';
import CheckIcon from './source/check.svg';
import CloseXIcon from './source/close-x.svg';
import CompleteKHIcon from './source/complete-k-h.svg';
import DocumentTemplateIcon from './source/document-template-icon.svg';
import DownloadIcon from './source/download-icon.svg';
import DropdownFilledIcon from './source/dropdown-filled-icon.svg';
import DropdownIcon from './source/dropdown-icon.svg';
import EditIcon from './source/edit.svg';
import ErrorAlertIcon from './source/error-alert-icon.svg';
import ErrorChatBotIcon from './source/error-chat-bot.svg';
import ErrorIconMessengerIcon from './source/error-icon-messenger.svg';
import ErrorQCIcon from './source/error-q-c.svg';
import ExcelIcon from './source/excel.svg';
import ExportMaterialsIcon from './source/export-materials-icon.svg';
import FileIcon from './source/file-icon.svg';
import FunnelIcon from './source/funnel.svg';
import IconStarIcon from './source/icon-star.svg';
import KanbanIcon from './source/kanban-icon.svg';
import LateLSXIcon from './source/late-l-s-x.svg';
import ListChecksIcon from './source/list-checks-icon.svg';
import LoadingDataChatBotIcon from './source/loading-data-chat-bot.svg';
import MagnifyingGlassIcon from './source/magnifying-glass-icon.svg';
import MobileIcon from './source/mobile-icon.svg';
import NoteIcon from './source/note-icon.svg';
import PasswordIcon from './source/password-icon.svg';
import PlusIcon from './source/plus.svg';
import PrintTemplateIcon from './source/print-template-icon.svg';
import PrinterIcon from './source/printer-icon.svg';
import PrinterIcon2 from './source/printer-icon2.svg';
import PrinterTemIcon from './source/printer-tem.svg';
import RefreshIcon from './source/refresh.svg';
import SealCheckIcon from './source/seal-check.svg';
import SaleIcon from './source/sale-icon.svg';
import SaveIcon from './source/save-icon.svg';
import SearchIcon from './source/search.svg';
import SendMessengerIcon from './source/send-messenger-icon.svg';
import SignOutIcon from './source/sign-out-icon.svg';
import SparkleIcon from './source/sparkle-icon.svg';
import SparkleOutlineIcon from './source/sparkle-outline-icon.svg';
import StickerIcon from './source/sticker-icon.svg';
import SuccessAlertIcon from './source/success-alert-icon.svg';
import SuccessChatIcon from './source/success-chat-icon.svg';
import TemplateChecklistIcon from './source/template-checklist-icon.svg';
import TrashIcon from './source/trash.svg';
import UpgradeIcon from './source/upgrade-icon.svg';
import UserCircleIcon from './source/user-circle-icon.svg';
import WarningAlertIcon from './source/warning-alert-icon.svg';
import WarningIcon from './source/warning-icon.svg';

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
  CheckThinIcon,
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
