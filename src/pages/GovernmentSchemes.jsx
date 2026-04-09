import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import {
  governmentSchemeCategories,
  governmentSchemeCategoryMap,
  governmentSchemes,
} from '../data/governmentSchemesData'
import '../styles/government-schemes.css'

const viewOptions = new Set(['scheme-wise', 'category-wise'])

function GovernmentSchemes() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeView = viewOptions.has(searchParams.get('view'))
    ? searchParams.get('view')
    : 'scheme-wise'
  const activeCategoryId = searchParams.get('category') || governmentSchemeCategories[0].id
  const searchTerm = searchParams.get('search') || ''

  const filteredSchemes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return governmentSchemes.filter((scheme) => {
      if (!normalizedSearch) return true

      const haystack = [
        scheme.name,
        scheme.fullTitle,
        ...(scheme.sections || []).map((section) => `${section.title} ${section.content}`),
        governmentSchemeCategoryMap[scheme.categoryId]?.name,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [searchTerm])

  const visibleCategory = governmentSchemeCategoryMap[activeCategoryId] || governmentSchemeCategoryMap[governmentSchemeCategories[0].id]
  const visibleCategorySchemes = filteredSchemes.filter((scheme) => scheme.categoryId === visibleCategory.id)

  const setView = (nextView) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('view', nextView)
    setSearchParams(nextParams)
  }

  const setCategory = (categoryId) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('view', 'category-wise')
    nextParams.set('category', categoryId)
    setSearchParams(nextParams)
  }

  const setSearch = (event) => {
    const nextParams = new URLSearchParams(searchParams)
    const nextValue = event.target.value

    if (nextValue) {
      nextParams.set('search', nextValue)
    } else {
      nextParams.delete('search')
    }

    setSearchParams(nextParams)
  }

  return (
    <>
      <PageHeader title="Government Schemes" breadcrumb="Government Schemes" />

      <section className="government-schemes-page pt-120 pb-120">
        <div className="container gs-shell">
          <div className="gs-hero fade-top">
            <div className="gs-hero-grid">
              <div>
                <span className="gs-eyebrow">Scheme Discovery</span>
                <h2>Find central and state support faster.</h2>
                <p>
                  This directory mirrors the scheme-wise and category-wise discovery flow from your reference,
                  with all categories included and a curated sample dataset so the experience feels complete.
                </p>
              </div>

              <div className="gs-hero-stats">
                <div className="gs-stat-card">
                  <strong>{governmentSchemeCategories.length}</strong>
                  <span>categories seeded</span>
                </div>
                <div className="gs-stat-card">
                  <strong>{governmentSchemes.length}</strong>
                  <span>sample schemes displayed</span>
                </div>
                <div className="gs-stat-card">
                  <strong>2</strong>
                  <span>browsing modes</span>
                </div>
                <div className="gs-stat-card">
                  <strong>1</strong>
                  <span>detail page per scheme</span>
                </div>
              </div>
            </div>
          </div>

          <div className="gs-toolbar">
            <div className="gs-toggle" role="tablist" aria-label="Government scheme view switcher">
              <button
                type="button"
                className={activeView === 'scheme-wise' ? 'is-active' : ''}
                onClick={() => setView('scheme-wise')}
              >
                Scheme Wise
              </button>
              <button
                type="button"
                className={activeView === 'category-wise' ? 'is-active' : ''}
                onClick={() => setView('category-wise')}
              >
                Category Wise
              </button>
            </div>

            <div className="gs-toolbar-actions">
              <label className="gs-search" aria-label="Search schemes">
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  type="search"
                  placeholder="Search by scheme, category, or ministry"
                  value={searchTerm}
                  onChange={setSearch}
                />
              </label>
              <span className="gs-filter-note">
                Showing {filteredSchemes.length} schemes from a curated subset of the reference catalog
              </span>
            </div>
          </div>

          {activeView === 'scheme-wise' ? (
            filteredSchemes.length > 0 ? (
              <div className="gs-grid fade-wrapper">
                {filteredSchemes.map((scheme) => {
                  const category = governmentSchemeCategoryMap[scheme.categoryId]

                  return (
                    <Link className="gs-card fade-top" key={scheme.id} to={`/government-schemes/${scheme.id}`}>
                      <div className="gs-card-top">
                        <span className="gs-chip">{category.name}</span>
                      </div>

                      <h3>{scheme.name}</h3>

                      <div className="gs-card-footer">
                        <span>Open detail page</span>
                        <span className="gs-link">
                          View Scheme
                          <i className="fa-solid fa-arrow-right" />
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="gs-empty-state">
                <h3>No schemes match this search.</h3>
                <p>Try a shorter keyword or switch to category-wise browsing to explore the seeded catalog.</p>
              </div>
            )
          ) : (
            <div className="gs-category-layout">
              <aside className="gs-category-sidebar">
                <h3>Category</h3>

                <div className="gs-category-list">
                  {governmentSchemeCategories.map((category) => {
                    const count = governmentSchemeCategoryMap[category.id].schemes.length

                    return (
                      <button
                        type="button"
                        key={category.id}
                        className={`gs-category-button${visibleCategory.id === category.id ? ' is-active' : ''}`}
                        onClick={() => setCategory(category.id)}
                      >
                        <div>
                          <strong>{category.name}</strong>
                        </div>
                        <em>{count}</em>
                      </button>
                    )
                  })}
                </div>
              </aside>

              <div className="gs-category-panel">
                <h3>{visibleCategory.name}</h3>

                {visibleCategorySchemes.length > 0 ? (
                  <div className="gs-category-scheme-list">
                    {visibleCategorySchemes.map((scheme) => (
                      <Link className="gs-category-scheme" key={scheme.id} to={`/government-schemes/${scheme.id}`}>
                        <div>
                          <h4>{scheme.name}</h4>
                        </div>
                        <i className="fa-solid fa-arrow-right" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="gs-empty-state">
                    <h3>No schemes match this search in {visibleCategory.name}.</h3>
                    <p>Clear the search box to see the full seeded list for this category.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default GovernmentSchemes
