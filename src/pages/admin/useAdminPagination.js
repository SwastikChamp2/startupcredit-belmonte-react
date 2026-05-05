import { useMemo, useState } from 'react'

export default function useAdminPagination(items) {
  const [pageSize, setPageSize] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const activePage = Math.min(currentPage, totalPages)

  const paginatedItems = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize
    return items.slice(startIndex, startIndex + pageSize)
  }, [activePage, items, pageSize])

  return {
    currentPage: activePage,
    pageSize,
    paginatedItems,
    setCurrentPage,
    setPageSize,
    totalItems,
    totalPages,
  }
}
