import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

function Service() {
  return (
    // TODO: Paste converted JSX from service.html
    // Sections: service-section, service-intro, etc.
    // Do NOT include header, footer, preloader, sidebar, search-popup, scroll-percentage
    <>
      <PageHeader title="Our Services" breadcrumb="Services" />
      <section className="service-section-4 pt-120 pb-120">
    <div className="container">
      <div className="row gy-4 fade-wrapper">
        <div className="col-lg-4 col-md-6">
          <div className="service-item-4 fade-top">
            <div className="service-thumb">
              <img className="main-img" src="assets/img/service/service-img-4.png" alt="service" />
              <div className="icon"><img src="assets/img/icon/service-icon-5.png" alt="icon" /></div>
            </div>
            <div className="service-content">
              <h3 className="title"><Link to="/service-details">Strategic Planning</Link></h3>
              <p>Deliver plug commerce with dynamic is expertise. leading edge products with business
                models</p>
              <Link to="/service-details" className="read-more">Read Details <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="service-item-4 fade-top">
            <div className="service-thumb">
              <img className="main-img" src="assets/img/service/service-img-5.png" alt="service" />
              <div className="icon"><img src="assets/img/icon/service-icon-6.png" alt="icon" /></div>
            </div>
            <div className="service-content">
              <h3 className="title"><Link to="/service-details">Financial Consulting</Link></h3>
              <p>Deliver plug commerce with dynamic is expertise. leading edge products with business
                models</p>
              <Link to="/service-details" className="read-more">Read Details <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="service-item-4 fade-top">
            <div className="service-thumb">
              <img className="main-img" src="assets/img/service/service-img-6.png" alt="service" />
              <div className="icon"><img src="assets/img/icon/service-icon-7.png" alt="icon" /></div>
            </div>
            <div className="service-content">
              <h3 className="title"><Link to="/service-details">Branding Strategy</Link></h3>
              <p>Deliver plug commerce with dynamic is expertise. leading edge products with business
                models</p>
              <Link to="/service-details" className="read-more">Read Details <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="service-item-4 fade-top">
            <div className="service-thumb">
              <img className="main-img" src="assets/img/service/service-img-7.png" alt="service" />
              <div className="icon"><img src="assets/img/icon/service-icon-8.png" alt="icon" /></div>
            </div>
            <div className="service-content">
              <h3 className="title"><Link to="/service-details">Human Resources</Link></h3>
              <p>Deliver plug commerce with dynamic is expertise. leading edge products with business
                models</p>
              <Link to="/service-details" className="read-more">Read Details <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="service-item-4 fade-top">
            <div className="service-thumb">
              <img className="main-img" src="assets/img/service/service-img-8.png" alt="service" />
              <div className="icon"><img src="assets/img/icon/service-icon-9.png" alt="icon" /></div>
            </div>
            <div className="service-content">
              <h3 className="title"><Link to="/service-details">Process Optimization</Link></h3>
              <p>Deliver plug commerce with dynamic is expertise. leading edge products with business
                models</p>
              <Link to="/service-details" className="read-more">Read Details <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="service-item-4 fade-top">
            <div className="service-thumb">
              <img className="main-img" src="assets/img/service/service-img-9.png" alt="service" />
              <div className="icon"><img src="assets/img/icon/service-icon-10.png" alt="icon" /></div>
            </div>
            <div className="service-content">
              <h3 className="title"><Link to="/service-details">Risk Management</Link></h3>
              <p>Deliver plug commerce with dynamic is expertise. leading edge products with business
                models</p>
              <Link to="/service-details" className="read-more">Read Details <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* ./ service-section */}
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
        <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />company strength</h4>
        <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Our Team Build
          Amazing Growth</h2>
      </div>
      <div className="row gy-lg-0 gy-4 justify-content-center fade-wrapper">
        <div className="col-lg-4 col-md-6">
          <div className="counter-card fade-top">
            <div className="icon"><img src="assets/img/icon/counter-1.png" alt="icon" /></div>
            <div className="content">
              <h3 className="title"><span className="odometer" data-count={858}>0</span>+</h3>
              <p>Live Projects</p>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="counter-card fade-top">
            <div className="icon"><img src="assets/img/icon/counter-2.png" alt="icon" /></div>
            <div className="content">
              <h3 className="title"><span className="odometer" data-count={16}>0</span>k+</h3>
              <p>Service Complete</p>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="counter-card fade-top">
            <div className="icon"><img src="assets/img/icon/counter-3.png" alt="icon" /></div>
            <div className="content">
              <h3 className="title"><span className="odometer" data-count={92}>0</span>+</h3>
              <p>Global Awards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* ./ service-section */}
  <section className="service-process pt-120 pb-120">
    <div className="container">
      <div className="section-heading">
        <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />How we works</h4>
        <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Follow 4 Easy
          Working Step </h2>
      </div>
      <div className="row gy-lg-0 gy-4 fade-wrapper">
        <div className="col-lg-3 col-md-6 fade-top">
          <div className="service-process-card">
            <span className="number">01</span>
            <h3 className="title">Assessment</h3>
            <p>Team conducts a thorough assessment of the client's current situation,</p>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 fade-top">
          <div className="service-process-card">
            <span className="number">02</span>
            <h3 className="title">Development</h3>
            <p>Team conducts a thorough assessment of the client's current situation,</p>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 fade-top">
          <div className="service-process-card">
            <span className="number">03</span>
            <h3 className="title">Implementation</h3>
            <p>Team conducts a thorough assessment of the client's current situation,</p>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 fade-top">
          <div className="service-process-card">
            <span className="number">04</span>
            <h3 className="title">Evaluation</h3>
            <p>Team conducts a thorough assessment of the client's current situation,</p>
          </div>
        </div>
      </div>
    </div>
  </section>
    </>
  )
}

export default Service
