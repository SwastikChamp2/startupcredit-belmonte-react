const PAGE_SIZE_OPTIONS = [25, 50, 100]

function getPageButtonRange(currentPage, totalPages) {
  const pages = []
  const firstPage = Math.max(1, currentPage - 2)
  const lastPage = Math.min(totalPages, firstPage + 4)

  for (let page = firstPage; page <= lastPage; page += 1) {
    pages.push(page)
  }

  return pages
}

function AdminPagination({
  currentPage,
  itemLabel = 'entries',
  pageSize,
  setCurrentPage,
  setPageSize,
  totalItems,
  totalPages,
  totalRecords,
}) {
  const activePage = Math.min(currentPage, totalPages)
  const from = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1
  const to = Math.min(activePage * pageSize, totalItems)
  const pages = getPageButtonRange(activePage, totalPages)

  return (
    <footer className="admin-users-footer admin-pagination-footer">
      <span>
        Showing {from}-{to} of {totalItems} {itemLabel}
        {typeof totalRecords === 'number' && totalRecords !== totalItems ? ` (${totalRecords} total)` : ''}
      </span>

      <div className="admin-page-size">
        <label htmlFor={`${itemLabel.replace(/\s+/g, '-')}-page-size`}>Rows per page</label>
        <select
          id={`${itemLabel.replace(/\s+/g, '-')}-page-size`}
          onChange={(event) => {
            setPageSize(Number(event.target.value))
            setCurrentPage(1)
          }}
          value={pageSize}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <nav className="admin-pagination" aria-label={`${itemLabel} pagination`}>
        <button
          aria-label="Previous page"
          disabled={activePage === 1}
          onClick={() => setCurrentPage(activePage - 1)}
          type="button"
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        {pages.map((page) => (
          <button
            className={page === activePage ? 'active' : ''}
            key={page}
            onClick={() => setCurrentPage(page)}
            type="button"
          >
            {page}
          </button>
        ))}
        <button
          aria-label="Next page"
          disabled={activePage === totalPages}
          onClick={() => setCurrentPage(activePage + 1)}
          type="button"
        >
          <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
      </nav>
    </footer>
  )
}

export default AdminPagination
