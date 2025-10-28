import { useBranchAllList } from '@/hooks/common/useBranch'
import { useEffect, useMemo, useState } from 'react'

// Hook dùng chung: lưu/đọc danh sách chi nhánh đã chọn qua localStorage
// - Tự động chọn chi nhánh đầu tiên nếu chưa chọn
// - Tự động lọc các id không còn hợp lệ khi danh sách chi nhánh thay đổi
export function usePersistedBranches(storageKey = 'report_branch_ids') {
  const { data: branchOptions = [] } = useBranchAllList()
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
    } catch (e) {}
  }, [key])

  // Khi danh sách chi nhánh sẵn sàng
  useEffect(() => {
    if (!Array.isArray(branchOptions) || branchOptions.length === 0) return

    // Nếu chưa có lựa chọn (sau khi đã hydrate) thì chọn mặc định chi nhánh đầu
    if (!Array.isArray(selectedBranches) || selectedBranches.length === 0) {
      setSelectedBranches([branchOptions[0].value])
      return
    }

    const validSet = new Set(branchOptions.map(b => b.value))
    const filtered = selectedBranches.filter(id => validSet.has(id))
    if (filtered.length !== selectedBranches.length) {
      setSelectedBranches(filtered.length > 0 ? filtered : [branchOptions[0].value])
    }
  }, [branchOptions])

  // Lưu vào localStorage khi thay đổi
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(selectedBranches || []))
    } catch (e) {}
  }, [selectedBranches, key])

  return { branchOptions, selectedBranches, setSelectedBranches }
}


