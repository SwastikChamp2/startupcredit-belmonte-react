import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { servicesData } from '../data/servicesData'

function Service() {
  return (
    <>
      <PageHeader title="Our Services" breadcrumb="Our Services" />

      <section className="service-section-4 pt-120 pb-120">
        <div className="container">
          <div className="row gy-4 fade-wrapper" id="services-container">
            {servicesData.map((service, i) => (
              <div className="col-lg-4 col-md-6" key={i}>
                <Link to={`/service-details?scheme=${service.scheme}`} className="service-card-link">
                  <div className="service-item-4 fade-top">
                    <div className="service-thumb">
                      <img className="main-img" src={service.image} alt={service.alt} />
                      <div className="icon"><img src="assets/img/icon/service-icon-5.png" alt="icon" /></div>
                    </div>
                    <div className="service-content">
                      <h3 className="title">{service.title}</h3>
                      <p>{service.description}</p>
                      <span className="read-more">READ DETAILS &#10140;</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="service-counter pt-120 pb-120">
        <div className="bg-item">
          <div className="bg-img" data-background="assets/img/bg-img/service-counter-bg.jpg" />
          <div className="overlay" />
          <div className="shapes">
            <div className="shape shape-1"><img src="assets/img/shapes/service-counter-shape-1.png" alt="shape" /></div>
            <div className="shape shape-2"><img src="assets/img/shapes/service-counter-shape-2.png" alt="shape" /></div>
          </div>
        </div>
        <div className="container">
          <div className="section-heading text-center white-content">
            <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />OUR PROGRESS</h4>
            <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Our Team Builds Amazing Growth</h2>
          </div>
          <div className="row gy-lg-0 gy-4 justify-content-center fade-wrapper">
            <div className="col-lg-4 col-md-6">
              <div className="counter-card fade-top">
                <div className="icon"><img src="assets/img/icon/counter-1.png" alt="Startups Helped icon" /></div>
                <div className="content">
                  <h3 className="title"><span className="odometer" data-count={258}>0</span>+</h3>
                  <p>Startups Helped</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="counter-card fade-top">
                <div className="icon"><img src="assets/img/icon/counter-2.png" alt="Projects Closed icon" /></div>
                <div className="content">
                  <h3 className="title"><span className="odometer" data-count={789}>0</span>+</h3>
                  <p>Projects Closed</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="counter-card fade-top">
                <div className="icon"><img src="assets/img/icon/counter-3.png" alt="Deals Closed icon" /></div>
                <div className="content">
                  <h3 className="title"><span className="odometer" data-count={1222}>0</span>+</h3>
                  <p>Deals CLosed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="service-process pt-120 pb-120">
        <div className="container">
          <div className="section-heading">
            <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />HOW WE WORK</h4>
            <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Get Funded with 4 Easy Steps</h2>
          </div>
          <div className="row gy-lg-0 gy-4 fade-wrapper">
            <div className="col-lg-3 col-md-6 fade-top">
              <div className="service-process-card">
                <span className="number">01</span>
                <h3 className="title">Discover</h3>
                <p>We begin by understanding your business, funding needs, eligibility, and goals to identify the best financing options.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 fade-top">
              <div className="service-process-card">
                <span className="number">02</span>
                <h3 className="title">Prepare</h3>
                <p>We guide you in preparing your application, documentation for easy and hassle-free submission.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 fade-top">
              <div className="service-process-card">
                <span className="number">03</span>
                <h3 className="title">Apply</h3>
                <p>We coordinate with banks, institutions, investors and manage the entire application and approval process.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 fade-top">
              <div className="service-process-card">
                <span className="number">04</span>
                <h3 className="title">Grow</h3>
                <p>After disbursement, we help you review terms and plan repayments so your business can scale with confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Service
