import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import '../styles/home-popup.css'
import '../styles/home-promos.css'
import '../styles/home-overrides.css'

const mobileValidationProps = {
  inputMode: 'numeric',
  pattern: '[0-9]{10}',
  maxLength: 10,
  title: 'Please enter a 10-digit mobile number',
  onInput: (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)
  },
  onInvalid: (e) => {
    e.target.setCustomValidity('Please enter a valid 10-digit mobile number')
  },
  onChange: (e) => {
    e.target.setCustomValidity('')
  },
}

function Home() {
  const [requestMsg, setRequestMsg] = useState('')
  const [showEntryModal, setShowEntryModal] = useState(() => {
    if (typeof window === 'undefined') return false

    return !window.sessionStorage.getItem('home-entry-modal-seen')
  })
  const [entryMsg, setEntryMsg] = useState('')

  const handleRequestSubmit = (e) => {
    e.preventDefault()
    setRequestMsg('Your request has been submitted successfully!')
    e.target.reset()
    setTimeout(() => setRequestMsg(''), 5000)
  }

  useEffect(() => {
    if (showEntryModal) {
      window.sessionStorage.setItem('home-entry-modal-seen', 'true')
    }
  }, [showEntryModal])

  useEffect(() => {
    if (!showEntryModal) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [showEntryModal])

  const handleEntrySubmit = (e) => {
    e.preventDefault()
    setEntryMsg('Thanks! Our team will connect with you shortly.')
    e.target.reset()
    setTimeout(() => {
      setEntryMsg('')
      setShowEntryModal(false)
    }, 1600)
  }

  const promoSchemes = [
    { amount: 'Rs20cr', name: 'CGSS Scheme' },
    { amount: 'Rs10cr', name: 'CGTMSE Loan' },
    { amount: 'Rs10cr', name: 'NBFC Loan' },
    { amount: 'Rs2cr', name: 'NAIF Loan' },
  ]

  const promoSupportCards = [
    {
      eyebrow: 'Save Upto',
      title: '100% TAX',
      description: 'with Tax Exemption Certificate',
    },
    {
      eyebrow: '50+',
      title: 'Government Certificate',
      description: 'Delivered Pan India',
    },
    {
      eyebrow: 'Register your business',
      title: 'in just 7 days',
      description: '',
    },
    {
      eyebrow: 'Sell your',
      title: 'Products & Services',
      description: 'directly to Government GeM',
    },
  ]

  return (
    <>
  {showEntryModal && (
    <div className="home-entry-modal" role="dialog" aria-modal="true" aria-labelledby="home-entry-modal-title">
      <div className="home-entry-modal__dialog">
        <button
          type="button"
          className="home-entry-modal__close"
          onClick={() => setShowEntryModal(false)}
          aria-label="Close popup"
        >
          ×
        </button>

        <div className="home-entry-modal__grid">
          <div className="home-entry-modal__left">
            <span className="home-entry-modal__eyebrow">Guide Me Startup Credit</span>
            <h2 id="home-entry-modal-title">
              We help you access the <strong>right funding network</strong> for your next stage of growth.
            </h2>
            <p>
              From government schemes and agri-infra support to MSME loans, investor connects, and incubation-ready
              project guidance, we help founders move faster with better funding clarity.
            </p>

            <div className="home-entry-modal__stat">
              <strong>655+</strong>
              <span>projects already guided across startup, MSME, and scheme-led funding journeys</span>
            </div>

            <div className="home-entry-modal__cta">
              Share your plans
              <span>Get started now</span>
            </div>

            <div className="home-entry-modal__logos">
              <img src="assets/img/sponsor/sponsor-1.png" alt="Client brand" />
              <img src="assets/img/sponsor/sponsor-2.png" alt="Client brand" />
              <img src="assets/img/sponsor/sponsor-3.png" alt="Client brand" />
              <img src="assets/img/sponsor/sponsor-4.png" alt="Client brand" />
              <img src="assets/img/sponsor/sponsor-5.png" alt="Client brand" />
            </div>
          </div>

          <div className="home-entry-modal__right">
            <h3>Need expert support?</h3>
            <p>Drop your details and our team will help you identify the best funding route for your business.</p>

            {entryMsg && <div className="alert alert-success mt-3">{entryMsg}</div>}

            <form className="home-entry-modal__form" onSubmit={handleEntrySubmit}>
              <input type="text" className="form-control" placeholder="Full Name" required />
              <input type="email" className="form-control" placeholder="Email" required />
              <input type="tel" className="form-control" placeholder="Phone no." required {...mobileValidationProps} />
              <button className="bz-primary-btn" type="submit">Submit</button>
            </form>

            <div className="home-entry-modal__note">
              Already know what you need? Start with Select Project and we will guide the rest.
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  <section className="hero-section">
    <div className="hero-mask-img">
      <div className="overlay" />
      <div className="overlay-2" />
      <img src="assets/img/images/hero-img.png" alt="Young entrepreneurs celebrating startup success" />
    </div>
    <div className="shapes">
      <div className="shape shape-1"><img src="assets/img/shapes/hero-shape-1.png" alt="shape" /></div>
      <div className="shape shape-2"><img src="assets/img/shapes/hero-shape-2.png" alt="shape" /></div>
      <div className="shape shape-4"><img src="assets/img/shapes/hero-shape-4.png" alt="shape" /></div>
      <div className="round-shape" />
    </div>
    <div className="container">
      <div className="hero-wrap">
        <div className="hero-content">
          <div className="section-heading mb-40">
            <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />SIMPLIFYING STARTUP FINANCING</h4>
            <h2 className="section-title text-animation-effect"><span className="nowrap">Startup</span> <span className="nowrap">Credit</span> <br /> <span className="nowrap">Made</span> <span className="nowrap">Simple</span></h2>
            <p>From government schemes to private investors, we simplify startup financing by connecting you with the right funding options and expertly guide you through the complete process of startup financing.</p>
          </div>
          <div className="hero-btn-wrap">
            <Link to="/contact" className="bz-primary-btn">CONTACT US <i className="fas fa-arrow-right" /></Link>
            <Link to="/service" className="bz-primary-btn hero-btn">OUR SERVICES</Link>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className="about-section pt-120 pb-120">
    <div className="container">
      <div className="row align-items-center">
        <div className="col-lg-6 col-md-12">
          <div className="about-img-wrap">
            <div className="about-img img-reveal">
              <div className="img-overlay" />
              <img src="assets/img/images/about-img-1.png" alt="Startup financing growth illustration with money plant" />
            </div>
            <div className="shape" />
          </div>
        </div>
        <div className="col-lg-6 col-md-12">
          <div className="about-content fade-wrapper">
            <div className="section-heading heading-2 mb-30">
              <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />ABOUT OUR COMPANY</h4>
              <h2 className="section-title" data-text-animation data-split="word" data-duration={1}>Only Platform you need to finance your startup</h2>
              <p className="fade-top">From government schemes to private investors, we simplify startup financing by connecting you with the right funding options and expertly guide you through the complex process of startup financing.</p>
            </div>
            <div className="about-items">
              <div className="about-item fade-top">
                <div className="icon"><img src="assets/img/icon/about-icon-1.png" alt="Grow your business icon" /></div>
                <div className="content">
                  <h4 className="title">Grow your Business</h4>
                </div>
              </div>
              <div className="about-item fade-top">
                <div className="icon"><img src="assets/img/icon/about-icon-2.png" alt="Dedicated support icon" /></div>
                <div className="content">
                  <h4 className="title">Dedicated Support</h4>
                </div>
              </div>
            </div>
            <div className="about-btn-wrap fade-top">
              <Link to="/contact" className="bz-primary-btn">CONTACT US<i className="fas fa-arrow-right" /></Link>
              <a href="tel:+919850344666" className="bz-transparent-btn"><i className="fas fa-phone-volume" />+91 9850344666</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className="counter-section pt-120 pb-120" data-background="assets/img/bg-img/counter-bg.jpg">
    <div className="overlay" />
    <div className="shapes">
      <div className="shape shape-1"><img src="assets/img/shapes/counter-shape-1.png" alt="shape" /></div>
      <div className="shape shape-2"><img src="assets/img/shapes/counter-shape-2.png" alt="shape" /></div>
    </div>
    <div className="container">
      <div className="row gy-lg-0 gy-4 fade-wrapper">
        <div className="col-lg-3 col-md-6">
          <div className="counter-item fade-top">
            <div className="icon">
              <div className="icon-inner"><img src="assets/img/icon/counter-icon-1.png" alt="Amount Disbursed Icon" /></div>
              <div className="shape" />
            </div>
            <div className="counter-content">
              <h3 className="title"><span className="odometer" data-count={12}>0</span>Cr+</h3>
              <p>AMOUNT DISBURSED</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="counter-item fade-top">
            <div className="icon">
              <div className="icon-inner"><img src="assets/img/icon/counter-icon-2.png" alt="Projects Done Icon" /></div>
              <div className="shape" />
            </div>
            <div className="counter-content">
              <h3 className="title"><span className="odometer" data-count={655}>0</span></h3>
              <p>PROJECTS DONE</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="counter-item fade-top">
            <div className="icon">
              <div className="icon-inner"><img src="assets/img/icon/counter-icon-3.png" alt="Startups Helped Icon" /></div>
              <div className="shape" />
            </div>
            <div className="counter-content">
              <h3 className="title"><span className="odometer" data-count={567}>0</span></h3>
              <p>STARTUP HELPED</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="counter-item fade-top">
            <div className="icon">
              <div className="icon-inner"><img src="assets/img/icon/counter-icon-4.png" alt="Happy Clients Icon" /></div>
              <div className="shape" />
            </div>
            <div className="counter-content">
              <h3 className="title"><span className="odometer" data-count={288}>0</span></h3>
              <p>HAPPY CLIENTS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className="service-section pt-120 pb-120" data-background="assets/img/bg-img/service-bg.png">
    <div className="container">
      <div className="section-heading text-center">
        <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />OUR SERVICES<span className="right-shape" /></h4>
        <h2 className="section-title" data-text-animation data-split="word" data-duration={1}>Service We Provide</h2>
      </div>
      <div className="row fade-wrapper gy-lg-0 gy-4 justify-content-center">
        <div className="col-lg-4 col-md-6 fade-top">
          <div className="service-item">
            <div className="icon"><img src="assets/img/icon/service-icon-1.png" alt="Government Schemes Icon" /></div>
            <div className="service-content">
              <h3 className="title"><Link to="/service">Government Schemes</Link></h3>
              <p>Get access to PMEGP subsidy up to 35%, CGTMSE collateral-free loans, Stand-Up India, and many more government funding schemes with easy eligibility and application support.</p>
              <Link to="/service" className="bz-primary-btn">KNOW MORE <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6 fade-top">
          <div className="service-item">
            <div className="icon"><img src="assets/img/icon/service-icon-2.png" alt="Startup Funding Solutions Icon" /></div>
            <div className="service-content">
              <h3 className="title"><Link to="/service">Startup Funding Solutions</Link></h3>
              <p>Raise capital through Startup India Seed Fund Scheme and other Government Schemes, Grants, Angel Investments, Venture Capital funding, Seed funding, and Private Investors.</p>
              <Link to="/service" className="bz-primary-btn">KNOW MORE <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6 fade-top">
          <div className="service-item">
            <div className="icon"><img src="assets/img/icon/service-icon-3.png" alt="MSME Loan Services Icon" /></div>
            <div className="service-content">
              <h3 className="title"><Link to="/service">MSME Loan Services</Link></h3>
              <p>Get MSME loans through quick working capital loans, affordable term loans, invoice financing, equipment loans with up to 100% funding support.</p>
              <Link to="/service" className="bz-primary-btn">KNOW MORE <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className="home-promos-section pt-120 pb-120">
    <div className="container">
      <div className="home-promos-shell">
        <div className="home-promos-grid fade-wrapper">
          <div className="home-promo-panel home-promo-panel--white home-promo-col-6 fade-top">
            <h3>50+</h3>
            <p><strong>Government Funding</strong><br />schemes curated for different growth stages.</p>
          </div>
          <div className="home-promo-panel home-promo-col-6 fade-top">
            <p>Funding Schemes for</p>
            <h4>Manufacturing sector</h4>
          </div>
          <div className="home-promo-panel home-promo-col-7 fade-top">
            <p>Funding Schemes for</p>
            <h4>Service sector</h4>
          </div>
          <div className="home-promo-panel home-promo-panel--white home-promo-col-5 fade-top">
            <p>Funding Schemes for</p>
            <h4><strong>Agriculture sector</strong></h4>
          </div>
        </div>

        <h2 className="home-promo-heading">Popular SCHEMES</h2>

        <div className="home-promo-cards fade-wrapper">
          {promoSchemes.map((item) => (
            <div className="home-promo-card-wrap fade-top" key={item.name}>
              <div className="home-promo-card">
                <small>upto</small>
                <strong>{item.amount}</strong>
                <p>{item.name}</p>
              </div>
              <Link to="/select-project" className="home-promo-apply">
                Apply Now
                <i className="fas fa-arrow-right" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>

  <section className="home-promos-section pb-120">
    <div className="container">
      <div className="home-promos-shell">
        <div className="home-promos-grid fade-wrapper">
          <div className="home-promo-panel home-promo-panel--white home-promo-col-6 fade-top">
            <h4>Suitable Business Entity</h4>
            <div className="home-promo-chip-wrap">
              {['Sole Proprietorship', 'NGO / Non-Profit', 'Pvt Ltd', 'LLP', 'Partnership Firm', 'OPC', 'MSME'].map((item) => (
                <span className="home-promo-chip" key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div className="home-promo-panel home-promo-col-6 fade-top">
            <h4>Registrations for all stages of your business</h4>
            <div className="home-promo-chip-wrap">
              {['DPIIT', 'GST', 'MSME', 'Trademark', 'FSSAI', 'IEC', 'ISO'].map((item) => (
                <span className="home-promo-chip" key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div className="home-promo-panel home-promo-col-7 fade-top">
            <h4>100% Transparent & Trackable Process</h4>
          </div>
          <div className="home-promo-panel home-promo-panel--white home-promo-col-5 fade-top">
            <h4><strong>Trusted By Thousands</strong></h4>
            <p><strong style={{ fontSize: '42px', color: '#101d36' }}>5000+</strong> Startups & MSME<br />Already Launched With Us.</p>
          </div>
        </div>

        <div className="home-promo-cards fade-wrapper">
          {promoSupportCards.map((item) => (
            <div className="home-promo-card-wrap fade-top" key={item.title}>
              <div className="home-promo-card">
                <small>{item.eyebrow}</small>
                <h5>{item.title}</h5>
                {item.description ? <p className="home-promo-card__muted">{item.description}</p> : null}
              </div>
              <Link to="/select-project" className="home-promo-apply">
                Apply Now
                <i className="fas fa-arrow-right" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>

  <section className="content-section pt-120 pb-120">
    <div className="content-container">
      <div className="content-wrap pt-120 pb-120" data-background="assets/img/bg-img/content-bg.png">
        <div className="shapes">
          <div className="shape-1" />
          <div className="shape-2" />
        </div>
        <div className="content-box">
          <div className="section-heading mb-30">
            <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />DETERMINATION OF OUR CORE TEAM</h4>
            <h2 className="section-title" data-text-animation data-split="word" data-duration={1}>Bringing Startup Vision to reality one project at a time</h2>
          </div>
          <div className="content-tab">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">ABOUT US</button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">OUR MISSION</button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact" type="button" role="tab" aria-controls="contact" aria-selected="false">OUR VISION</button>
              </li>
            </ul>
            <div className="tab-content" id="myTabContent">
              <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                <div className="tab-info">
                  <p>We work closely with founders, MSMEs, and entrepreneurs to identify the best financing routes, eliminate delays, and ensure maximum financial advantage.</p>
                  <div className="tab-progress">
                    <div className="progress">
                      <div className="progress-bar wow slideInLeft" data-wow-delay="0ms" data-wow-duration="2000ms" role="progressbar" style={{width: '75%', visibility: 'visible', animationDuration: '2000ms', animationDelay: '0ms', animationName: 'slideInLeft'}}>
                        <span>75%</span>
                      </div>
                    </div>
                    <h4 className="title">Startup Financed</h4>
                  </div>
                  <Link to="/contact" className="bz-primary-btn">CONTACT NOW</Link>
                </div>
              </div>
              <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                <div className="tab-info">
                  <p>Our mission is to simplify access to capital, remove barriers in funding, and support every startup/MSME to achieve sustainable growth through transparent and efficient financing solutions.</p>
                  <Link to="/contact" className="bz-primary-btn">CONTACT NOW</Link>
                </div>
              </div>
              <div className="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
                <div className="tab-info">
                  <p>Our vision is to become the most trusted one-stop platform in India for startup and MSME financing, empowering thousands of entrepreneurs to turn ideas into successful businesses.</p>
                  <Link to="/contact" className="bz-primary-btn">CONTACT NOW</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className="team-section pt-120 pb-120 fade-wrapper" id="team-section">
    <div className="bg-shape fade-right"><img src="assets/img/shapes/team-shape-1.png" alt="Team Background Shape" /></div>
    <div className="container">
      <div className="team-top">
        <div className="section-heading white-content">
          <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />OUR TEAM MEMBERS</h4>
          <h2 className="section-title" data-text-animation data-split="word" data-duration={1}>Meet The Expert Team Members</h2>
        </div>
      </div>
    </div>
    <div className="team-wrap">
      <div className="row gy-lg-0 gy-4 fade-wrapper">
        {[
          { img: 'team-1.png', name: 'Neha Agarwal', role: 'Startup Finance Consultant' },
          { img: 'team-2.png', name: 'Amit Verma', role: 'Business Funding Strategist' },
          { img: 'team-3.png', name: 'Pooja Nair', role: 'MSME & Government Schemes Advisor' },
          { img: 'team-4.png', name: 'Rahul Khanna', role: 'Credit & Loan Solutions Lead' },
        ].map((member) => (
          <div className="col-lg-3 col-md-6 fade-top" key={member.name}>
            <div className="team-item">
              <div className="team-thumb">
                <img src={`assets/img/team/${member.img}`} alt={`Team member`} />
                <div className="shapes">
                  <div className="shape-1" />
                  <div className="shape-2" />
                </div>
              </div>
              <div className="team-content-wrap">
                <div className="team-content">
                  <h3 className="title"><a href="#">{member.name}</a></h3>
                  <span>{member.role}</span>
                </div>
                <div className="team-social">
                  <div className="expand"><i className="fa-solid fa-share-nodes" /></div>
                  <ul className="social-list">
                    <li><a href="#" className="facebook"><i className="fab fa-facebook-f" /></a></li>
                    <li><a href="#" className="instagram"><i className="fab fa-instagram" /></a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>

  <section className="project-section pt-120 pb-120" id="project-section">
    <div className="bg-shape" data-background="assets/img/bg-img/project-bg.png" />
    <div className="container">
      <div className="project-top heading-space">
        <div className="section-heading mb-0">
          <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />OUR PROJECTS</h4>
          <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Our Success Stories</h2>
        </div>
        <div className="swiper-arrow">
          <div className="swiper-nav swiper-next"><i className="fas fa-arrow-left" /></div>
          <div className="swiper-nav swiper-prev"><i className="fas fa-arrow-right" /></div>
        </div>
      </div>
      <Swiper
        className="project-carousel"
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={2}
        spaceBetween={30}
        loop={true}
        autoplay={true}
        speed={600}
        grabCursor={true}
        navigation={{
          nextEl: '.project-section .swiper-prev',
          prevEl: '.project-section .swiper-next',
        }}
        pagination={{ el: '.project-section .swiper-pagination', clickable: true }}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 30 },
          767: { slidesPerView: 2, spaceBetween: 30 },
          1024: { slidesPerView: 2 },
        }}
      >
        {[
          { img: 'project/project1.jpg', alt: 'Farmer with cash in field - success story', title: 'Farmer Entrepreneur', cat: 'Agri-Business Funding', desc: 'Enabled government scheme funding and working capital for rural startup, leading to expanded operations and higher income.' },
          { img: 'project/prooject-2.png', alt: 'Peter Dsouza - Healthyfit success', title: 'Peter Dsouza - Healthyfit', cat: 'MSME Loan Success', desc: 'StartupCredit helped Peter Dsouza of EdgeCore secure a fast MSME loan, ensuring smooth cash flow and business growth.' },
          { img: 'project/project-3.jpg', alt: 'Small factory owner - manufacturing success story', title: 'Manufacturing Startup', cat: 'Working Capital Finance', desc: 'Provided timely working capital and subsidy-linked funding, enabling the unit to scale production and meet growing demand.' },
          { img: 'project/project-4.png', alt: 'Tech founder in office - startup funding success', title: 'Tech Startup Founder', cat: 'Unsecured Business Loan', desc: 'Enabled quick, collateral-free funding for a tech startup, helping accelerate product development and market expansion.' },
        ].map((p, i) => (
          <SwiperSlide key={i}>
            <div className="project-item">
              <div className="project-img">
                <div className="overlay" />
                <div className="overlay-2" />
                <img src={`assets/img/${p.img}`} alt={p.alt} />
              </div>
              <div className="project-content">
                <h3 className="title"><a href="#">{p.title}</a></h3>
                <span>{p.cat}</span>
                <p>{p.desc}</p>
                <a href="#" className="bz-primary-btn">READ MORE</a>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="swiper-pagination" />
    </div>
  </section>

  <section className="testimonial-section pt-120 pb-120" data-background="assets/img/bg-img/testi-bg.png" id="testimonial-section">
    <div className="container">
      <div className="section-heading text-center">
        <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />CLIENT'S FEEDBACKS</h4>
        <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>What Our Customers Have to Say</h2>
      </div>
      <Swiper
        className="testi-carousel"
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={2}
        spaceBetween={30}
        loop={true}
        autoplay={true}
        speed={600}
        grabCursor={true}
        pagination={{ el: '.testimonial-section .swiper-pagination', clickable: true }}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 30 },
          767: { slidesPerView: 1, spaceBetween: 30 },
          1024: { slidesPerView: 2 },
        }}
      >
        {[
          { img: 'testi-author-1.png', name: 'Mohit Kumar', role: 'MSME Owner', text: '"StartupCredit helped us secure funding without collateral when banks said no. The process was smooth, transparent, and incredibly fast."' },
          { img: 'testi-author-2.png', name: 'Rohan Singh', role: 'Business Owner', text: '"Their understanding of government schemes saved us both time and money. Highly recommended for startups and MSMEs."' },
          { img: 'testi-author-3.png', name: 'Amit Verma', role: 'Startup Founder', text: '"StartupCredit guided us through every step of the funding process. Their team made complex finance simple and helped us grow with confidence."' },
          { img: 'testi-author-4.png', name: 'Sandeep Malhotra', role: 'Manufacturing Entrepreneur', text: '"What stood out was their transparency and speed. We received the right financial support exactly when our business needed it."' },
        ].map((t, i) => (
          <SwiperSlide key={i}>
            <div className="testi-item">
              <div className="testi-top">
                <div className="testi-author">
                  <img src={`assets/img/images/${t.img}`} alt={t.name} />
                  <h4 className="name">{t.name} <span>{t.role}</span></h4>
                </div>
                <div className="quote"><img src="assets/img/icon/quote.png" alt="quote icon" /></div>
              </div>
              <p>{t.text}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="swiper-pagination" />
    </div>
  </section>

  <section className="blog-section pt-120 pb-120 fade-wrapper">
    <div className="container">
      <div className="section-heading text-center">
        <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />OUR HAPPY CLIENTS</h4>
        <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Our Happy Clients</h2>
      </div>
      <Swiper
        className="sponsor-carousel"
        modules={[Autoplay]}
        slidesPerView={5}
        spaceBetween={50}
        loop={true}
        autoplay={true}
        speed={400}
        grabCursor={true}
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 25 },
          767: { slidesPerView: 3, spaceBetween: 30 },
          1024: { slidesPerView: 5 },
        }}
      >
        {[
          { img: 'sponsor-1.png', alt: 'homa logo' },
          { img: 'sponsor-2.png', alt: 'Hyedge logo' },
          { img: 'sponsor-3.png', alt: 'groth logo' },
          { img: 'sponsor-4.png', alt: 'Hydege logo' },
          { img: 'sponsor-5.png', alt: 'Xoyck logo' },
        ].map((s, i) => (
          <SwiperSlide key={i}>
            <div className="sponsor-item text-center">
              <a href="#"><img src={`assets/img/sponsor/${s.img}`} alt={s.alt} /></a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  </section>

  <section className="request-section">
    <div className="bg-color" />
    <div className="shapes">
      <div className="shape shape-1"><img src="assets/img/shapes/request-shape-1.png" alt="shape" /></div>
      <div className="shape shape-2"><img src="assets/img/shapes/request-shape-2.png" alt="shape" /></div>
    </div>
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <div className="request-form-wrap">
            <h3 className="form-header">Request A Callback</h3>
            {requestMsg && <div className="alert alert-success mt-3">{requestMsg}</div>}
            <form className="request-form" onSubmit={handleRequestSubmit}>
              <div className="form-group row">
                <div className="col-md-12">
                  <div className="form-item">
                    <input type="text" name="fullname" className="form-control" placeholder="Your Name" />
                  </div>
                </div>
              </div>
              <div className="form-group row">
                <div className="col-md-12">
                  <div className="form-item">
                    <input type="text" name="subject" className="form-control" placeholder="What you like to discuss?" />
                  </div>
                </div>
              </div>
              <div className="form-group row">
                <div className="col-md-12">
                  <div className="form-item">
                    <input type="tel" name="phone" className="form-control" placeholder="Phone number*" {...mobileValidationProps} />
                  </div>
                </div>
              </div>
              <div className="form-group row">
                <div className="col-md-12">
                  <div className="form-item message-item">
                    <textarea name="message" cols={30} rows={5} className="form-control address" placeholder="How can we help you?" defaultValue={""} />
                  </div>
                </div>
              </div>
              <div className="submit-btn">
                <button className="bz-primary-btn" type="submit">SEND REQUEST</button>
              </div>
            </form>
          </div>
        </div>
        <div className="col-md-6">
          <div className="request-img-wrap">
            <img className="men" src="assets/img/images/request-men.png" alt="Smiling business professional" />
            <img className="bg-img" src="assets/img/images/request-img.png" alt="Contact background" />
          </div>
        </div>
      </div>
    </div>
  </section>
    </>
  )
}

export default Home
