import { useBranchAllList } from '@/hooks/common/useBranch'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

// Hook dùng chung: lưu/đọc danh sách chi nhánh đã chọn qua localStorage
// - Tự động chọn chi nhánh đầu tiên nếu chưa chọn
// - Tự động lọc các id không còn hợp lệ khi danh sách chi nhánh thay đổi
export function usePersistedBranches(storageKey = 'report_branch_ids') {
  const { data: branchOptions = [] } = useBranchAllList()
  const authState = useSelector(state => state.auth)
  // Khởi tạo đồng bộ từ localStorage để tránh bị set về chi nhánh đầu tiên trước khi hydrate
  const [selectedBranches, setSelectedBranches] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(storageKey)
      const parsed = raw ? JSON.parse(raw) : null
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  })

  const key = useMemo(() => storageKey, [storageKey])

  // Đảm bảo key thay đổi thì đồng bộ lại từ localStorage (hiếm khi dùng)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setSelectedBranches(parsed)
        } else {
          setSelectedBranches([])
        }
      }
    } catch (e) { }
  }, [key])

  // Khi danh sách chi nhánh sẵn sàng
  useEffect(() => {
    if (!Array.isArray(branchOptions) || branchOptions.length === 0) return

    // Xác định chi nhánh mặc định theo user hiện tại (nếu có), fallback sang chi nhánh enabled đầu tiên
    const resolveDefaultBranchId = () => {
      if (authState?.branch_id) {
        return authState.branch_id
      }
      if (Array.isArray(authState?.branch) && authState.branch.length > 0) {
        return authState.branch[0]?.id
      }
      const firstEnabled = branchOptions.find(branch => branch.is_enabled === 1 || branch.is_enabled === true)
      return firstEnabled?.value
    }

    const defaultBranchId = resolveDefaultBranchId()

    // Nếu chưa có lựa chọn (sau khi đã hydrate) thì chọn mặc định chi nhánh đầu được enabled
    if (!Array.isArray(selectedBranches) || selectedBranches.length === 0) {
      if (defaultBranchId) {
        setSelectedBranches([defaultBranchId])
      }
      return
    }

    const validSet = new Set(branchOptions.map(b => b.value))
    const filtered = selectedBranches.filter(id => validSet.has(id))
    if (filtered.length !== selectedBranches.length) {
      if (filtered.length > 0) {
        setSelectedBranches(filtered)
      } else if (defaultBranchId) {
        setSelectedBranches([defaultBranchId])
      } else {
        setSelectedBranches([])
      }
    }
  }, [branchOptions, authState, selectedBranches])

  // Lưu vào localStorage khi thay đổi
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(selectedBranches || []))
    } catch (e) { }
  }, [selectedBranches, key])

  return { branchOptions, selectedBranches, setSelectedBranches }
}


