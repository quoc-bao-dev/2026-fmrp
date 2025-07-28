import apiComons from '@/Api/apiComon/apiComon'
import { optionsQuery } from '@/configs/optionsQuery'
import { useQuery } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'

/// danh sách chi nhánh
export const useBranchList = (param, value = null) => {
  const dispatch = useDispatch()

  return useQuery({
    queryKey: ['api_branch_list', param],
    queryFn: async () => {
      const { result } = await apiComons.apiBranchCombobox()

      const newData = result?.map((e) => ({ label: e.name, value: e.id })) || []

      dispatch({ type: 'branch/update', payload: newData })

      return newData
    },
    ...optionsQuery,
  })
}
