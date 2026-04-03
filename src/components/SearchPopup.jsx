import { useEffect } from 'react'

function SearchPopup() {
  useEffect(() => {
    const searchBox = document.getElementById('popup-search-box')
    const searchInput = document.getElementById('popup-search')
    const closeBtn = searchBox?.querySelector('.search-close')

    function closeSearch() {
      searchBox?.classList.remove('toggled')
    }

    function handleBodyClick(e) {
      if (!searchBox?.contains(e.target) && !e.target.closest('.dl-search-icon')) {
        closeSearch()
      }
    }

    function stopProp(e) {
      e.stopPropagation()
    }

    closeBtn?.addEventListener('click', closeSearch)
    searchInput?.addEventListener('click', stopProp)
    document.addEventListener('click', handleBodyClick)

    return () => {
      closeBtn?.removeEventListener('click', closeSearch)
      searchInput?.removeEventListener('click', stopProp)
      document.removeEventListener('click', handleBodyClick)
    }
  }, [])

  return (
    <div id="popup-search-box">
  <div className="box-inner-wrap d-flex align-items-center">
    <form id="form" action="#" method="get" role="search">
      <input id="popup-search" type="text" name="s" placeholder="Type keywords here..." />
    </form>
    <div className="search-close"><i className="fas fa-xmark" /></div>
  </div>
</div>
  )
}

export default SearchPopup
