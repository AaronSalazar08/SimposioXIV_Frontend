import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchEventos } from '../../api/eventos'
import { queryKeys } from '../../constants/queryKeys'

export function useEventos(appliedFilters) {
  return useQuery({
    queryKey: queryKeys.eventos(appliedFilters),
    queryFn: () => fetchEventos(appliedFilters),
    placeholderData: keepPreviousData,
  })
}
