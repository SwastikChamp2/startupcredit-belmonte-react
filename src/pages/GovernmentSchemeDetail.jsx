import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import {
  governmentSchemeCategoryMap,
  governmentSchemesById,
} from '../data/governmentSchemesData'
import '../styles/government-schemes.css'

function GovernmentSchemeDetail() {
  const { schemeId } = useParams()
  const scheme = governmentSchemesById[schemeId]
  const category = scheme ? governmentSchemeCategoryMap[scheme.categoryId] : null
  const relatedSchemes = scheme && category
    ? category.schemes.filter((entry) => entry.id !== scheme.id).slice(0, 3)
    : []

  useEffect(() => {
    if (scheme) {
      document.title = `${scheme.name} | Government Scheme Detail`
    }
  }, [scheme])

  if (!scheme || !category) {
    return (
      <>
        <PageHeader title="Scheme Detail" breadcrumb="Scheme Detail" />
        <section className="government-scheme-detail-page pt-120 pb-120">
          <div className="container">
            <div className="gs-empty-state">
              <h3>Scheme not found</h3>
              <p>The requested government scheme record is not available in the current seeded dataset.</p>
              <Link to="/government-schemes" className="bz-primary-btn">Back to Government Schemes</Link>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Scheme Detail" breadcrumb="Scheme Detail" />

      <section className="government-scheme-detail-page pt-120 pb-120">
        <div className="container gs-shell">
          <div className="gs-detail-grid">
            <div className="gs-section-stack">
              <div className="gs-detail-header fade-top">
                <span className="gs-eyebrow">Scheme Profile</span>
                <h2>{scheme.name}</h2>

                <div className="gs-detail-meta">
                  <span className="gs-detail-pill">
                    <i className="fa-solid fa-layer-group" />
                    {category.name}
                  </span>
                </div>
                <Link className="gs-back-link" to="/government-schemes">
                  <i className="fa-solid fa-arrow-left" />
                  Back to directory
                </Link>
              </div>

              {scheme.sections.map((section) => (
                <div className="gs-section-card fade-top" key={section.title}>
                  <div className="gs-section-highlight">{section.title}</div>
                  <h3>{section.title}</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{section.content}</p>
                </div>
              ))}
            </div>

            <aside className="gs-side-summary">
              <div className="gs-related-panel fade-top">
                <h3>Explore More</h3>

                <div className="gs-related-links">
                  {relatedSchemes.map((relatedScheme) => (
                    <Link className="gs-related-link" key={relatedScheme.id} to={`/government-schemes/${relatedScheme.id}`}>
                      <div>
                        <strong>{relatedScheme.name}</strong>
                        <span>{governmentSchemeCategoryMap[relatedScheme.categoryId]?.name}</span>
                      </div>
                      <i className="fa-solid fa-arrow-right" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="gs-related-panel fade-top">
                <h3>Browse by Category</h3>
                <p>Return to the category-wise listing for more schemes from the same catalog family.</p>
                <Link
                  className="bz-primary-btn"
                  to={`/government-schemes?view=category-wise&category=${category.id}`}
                >
                  View {category.name}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

export default GovernmentSchemeDetail
