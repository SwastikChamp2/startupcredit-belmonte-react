import { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { schemesData } from '../data/schemesData'

function ServiceDetails() {
  const [searchParams] = useSearchParams()
  const schemeId = searchParams.get('scheme') || 'invoice-financing'
  const scheme = schemesData[schemeId]

  useEffect(() => {
    if (scheme) {
      document.title = scheme.page_title
    }
  }, [scheme])

  if (!scheme) {
    return (
      <>
        <PageHeader title="Service Detail" breadcrumb="Service Detail" />
        <section className="error-section pt-120 pb-120">
          <div className="container text-center">
            <h2>Service not found</h2>
            <Link to="/service" className="bz-primary-btn">Back to Services</Link>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Service Detail" breadcrumb="Service Detail" />

      <section className="service-details pt-120 pb-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="service-details-content">
                <div className="service-details-img img-reveal">
                  <div className="img-overlay" />
                  <img src={scheme.service_details_image} alt={scheme.service_details_image_alt} />
                </div>

                <h2 className="details-title mb-20 mt-30">{scheme.service_name}</h2>
                <p className="mb-40">{scheme.page_body}</p>

                <div className="service-thumb-wrap">
                  <div className="service-thumb img-reveal">
                    <div className="img-overlay" />
                    <img src={scheme.feature_image_1} alt={`${scheme.service_name} feature 1`} />
                  </div>
                  <div className="service-thumb img-reveal">
                    <div className="img-overlay" />
                    <img src={scheme.feature_image_2} alt={`${scheme.service_name} feature 2`} />
                  </div>
                  <ul className="thumb-list">
                    {scheme.feature_bullet_points.map((point, i) => (
                      <li key={i}><i className="fas fa-circle-check" />{point}</li>
                    ))}
                  </ul>
                </div>

                <h2 className="details-title mb-20 mt-30">Our Approach</h2>
                <p>{scheme.our_approach_body}</p>

                {scheme.faqs && scheme.faqs.length > 0 && (
                  <div className="service-details-accordion">
                    <div className="accordion" id={`accordion-${schemeId}`}>
                      {scheme.faqs.map((faq, i) => {
                        const collapseId = `collapse-${schemeId}-${i}`
                        const headingId = `heading-${schemeId}-${i}`
                        const isFirst = i === 0
                        return (
                          <div className="accordion-item" key={i}>
                            <h2 className="accordion-header" id={headingId}>
                              <button
                                className={`accordion-button${isFirst ? '' : ' collapsed'}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#${collapseId}`}
                                aria-expanded={isFirst ? 'true' : 'false'}
                                aria-controls={collapseId}
                              >
                                {String(i + 1).padStart(2, '0')} {faq.question}
                              </button>
                            </h2>
                            <div
                              id={collapseId}
                              className={`accordion-collapse collapse${isFirst ? ' show' : ''}`}
                              aria-labelledby={headingId}
                              data-bs-parent={`#accordion-${schemeId}`}
                            >
                              <div className="accordion-body">{faq.answer}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-4">
              {scheme.download_files && scheme.download_files.length > 0 && (
                <div className="service-widget">
                  <div className="download-area">
                    {scheme.download_files.map((file, i) => (
                      <div className="download-item" key={i}>
                        <a href={file.href} target="_blank" rel="noreferrer" className="icon">
                          <img src="assets/img/icon/pdf.png" alt={file.title} />
                        </a>
                        <div className="content">
                          <h3 className="title">{file.title}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scheme.other_services && scheme.other_services.length > 0 && (
                <div className="service-widget">
                  <h4 className="widget-header">Other Services</h4>
                  <ul className="category-list">
                    {scheme.other_services.map((s, i) => (
                      <li key={i}>
                        <Link to={`/service-details?scheme=${s.href.split('scheme=')[1] || s.href}`}>{s.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="service-widget sticky-widget">
                <div className="service-widget-cta">
                  <div className="bg-item">
                    <div className="bg-img" data-background="assets/img/service/service-cta.png" />
                    <div className="overlay" />
                    <div className="shape"><img src="assets/img/shapes/service-cta-shape.png" alt="shape" /></div>
                  </div>
                  <div className="content text-center">
                    <a className="number" href="tel:+919850344666">+91-9850344666</a>
                    <span>Mon-Fri: 7:00 am-9:00 pm</span>
                    <span>24/7 Service Available</span>
                    <a href="tel:+919850344666" className="bz-primary-btn">CALL US NOW</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ServiceDetails
