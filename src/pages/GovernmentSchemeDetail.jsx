import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { fetchGovernmentSchemes } from '../services/staticDataApi'
import '../styles/government-schemes.css'
import '../styles/rich-text-content.css'

function GovernmentSchemeDetail() {
  const { schemeId } = useParams()
  const [data, setData] = useState({ schemesById: {}, categoryMap: {} })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchGovernmentSchemes()
      .then((value) => {
        if (!cancelled) setData({ schemesById: value.schemesById, categoryMap: value.categoryMap })
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err?.message || 'Could not load scheme.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const scheme = data.schemesById[schemeId]
  const category = scheme ? data.categoryMap[scheme.categoryId] : null
  const relatedSchemes = scheme && category
    ? category.schemes.filter((entry) => entry.id !== scheme.id).slice(0, 3)
    : []

  if (loading) {
    return (
      <>
        <PageHeader title="Scheme Detail" breadcrumb="Scheme Detail" />
        <section className="government-scheme-detail-page pt-120 pb-120">
          <div className="container">
            <p className="text-center text-muted">Loading scheme…</p>
          </div>
        </section>
      </>
    )
  }

  if (loadError || !scheme || !category) {
    return (
      <>
        <PageHeader title="Scheme Detail" breadcrumb="Scheme Detail" />
        <section className="government-scheme-detail-page pt-120 pb-120">
          <div className="container">
            <div className="gs-empty-state">
              <h3>{loadError ? 'Could not load scheme' : 'Scheme not found'}</h3>
              <p>{loadError || 'The requested government scheme record is not available in the current seeded dataset.'}</p>
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

              {/* New structured sections */}
              {scheme.objective && (
                <div className="gs-section-card fade-top">
                  <div className="gs-section-highlight">Objective</div>
                  <h3>Objective</h3>
                  <div className="gs-rich-content rich-text-render" dangerouslySetInnerHTML={{ __html: scheme.objective }} />
                </div>
              )}

              {scheme.benefits && (
                <div className="gs-section-card fade-top">
                  <div className="gs-section-highlight">Benefits</div>
                  <h3>Nature of Assistance</h3>
                  <div className="gs-rich-content rich-text-render" dangerouslySetInnerHTML={{ __html: scheme.benefits }} />
                </div>
              )}

              {scheme.beneficiary && (
                <div className="gs-section-card fade-top">
                  <div className="gs-section-highlight">Beneficiary</div>
                  <h3>Target Beneficiary</h3>
                  <div className="gs-rich-content rich-text-render" dangerouslySetInnerHTML={{ __html: scheme.beneficiary }} />
                </div>
              )}

              {scheme.eligibilityCriteria && (
                <div className="gs-section-card fade-top">
                  <div className="gs-section-highlight">Eligibility</div>
                  <h3>Eligibility Criteria</h3>
                  <div className="gs-rich-content rich-text-render" dangerouslySetInnerHTML={{ __html: scheme.eligibilityCriteria }} />
                </div>
              )}

              {scheme.description && (
                <div className="gs-section-card fade-top">
                  <div className="gs-section-highlight">Description</div>
                  <h3>Full Description</h3>
                  <div className="gs-rich-content rich-text-render" dangerouslySetInnerHTML={{ __html: scheme.description }} />
                </div>
              )}

              {/* Legacy sections support */}
              {(scheme.sections || []).map((section) => (
                <div className="gs-section-card fade-top" key={section.title}>
                  <div className="gs-section-highlight">{section.title}</div>
                  <h3>{section.title}</h3>
                  <div className="gs-rich-content rich-text-render" dangerouslySetInnerHTML={{ __html: section.content }} />
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
                        <span>{data.categoryMap[relatedScheme.categoryId]?.name}</span>
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
