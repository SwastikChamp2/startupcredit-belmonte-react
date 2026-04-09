import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

function About() {
  return (
    <>
      <PageHeader title="About Us" breadcrumb="About Us" />

      <section className="about-section-4 pt-120 pb-120">
        <div className="shapes">
          <div className="shape"><img src="assets/img/shapes/about-shape-3.png" alt="shape" /></div>
        </div>
        <div className="container">
          <div className="row align-items-center fade-wrapper">
            <div className="col-lg-6 col-md-12">
              <div className="about-content-4">
                <div className="section-heading mb-30">
                  <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />ABOUT OUR COMPANY</h4>
                  <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Empowering Startups with Smart Financing Solutions</h2>
                </div>
                <p className="fade-top">StartupCredit is a leading financing service provider helping startups, MSMEs, and entrepreneurs access the right capital through government schemes, institutional loans, and private funding options with complete transparency.</p>
                <div className="about-contact-items fade-top">
                  <div className="about-contact">
                    <div className="icon"><i className="fa fa-phone" /></div>
                    <div className="content">
                      <span>CALL TO ASK ANY QUERY</span>
                      <a href="tel:+919850344666">+91 9850344666</a>
                    </div>
                  </div>
                  <div className="about-author">
                    <img src="assets/img/images/about-author.png" alt="Ramesh Ingale, Founder & CEO" />
                    <h4 className="name"><span>Founder &amp; CEO</span>Ramesh Ingale</h4>
                  </div>
                </div>
                <div className="about-btn-wrap fade-top">
                  <Link to="/contact" className="bz-primary-btn about-btn">CONTACT US <i className="fa fa-arrow-right" /></Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-12">
              <div className="about-img-wrap-4 fade-top">
                <div className="about-img img-1">
                  <img src="assets/img/images/about-img-6.png" alt="industrial sunrise image" />
                </div>
                <div className="about-img img-2">
                  <img src="assets/img/images/about-img-7.png" alt="factory with robots image" />
                </div>
                <div className="about-counter">
                  <div className="shape"><img src="assets/img/shapes/about-counter-shape.png" alt="shape" /></div>
                  <h3 className="title"><span className="odometer" data-count={655}>0</span></h3>
                  <p>SUCCESSFUL PROJECTS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta fade-wrapper">
        <div className="container">
          <div className="about-cta-wrap pt-120 pb-120 text-center fade-top">
            <div className="bg-item">
              <div className="bg-img" data-background="assets/img/bg-img/about-cta-bg.jpg" />
              <div className="overlay" />
              <div className="overlay-2" />
              <div className="shape"><img src="assets/img/shapes/about-cta-shape.png" alt="shape" /></div>
            </div>
            <div className="section-heading white-content mb-40">
              <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />OUR MISSION</h4>
              <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Simplifying Business Finance with Strategic Expertise</h2>
            </div>
            <Link to="/contact" className="bz-primary-btn">CONTACT US <i className="fa fa-arrow-right" /></Link>
          </div>
        </div>
      </section>

      <section className="feature-section pt-120 pb-120">
        <div className="container">
          <div className="section-heading">
            <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />OUR FEATURES</h4>
            <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Unique Features We Provide</h2>
          </div>
          <div className="row gy-lg-0 gy-4 justify-content-center fade-wrapper">
            <div className="col-lg-4 col-md-6 fade-top">
              <div className="feature-item">
                <div className="bg-img"><img src="assets/img/images/feature-img-1.png" alt="feature" /></div>
                <div className="icon"><img src="assets/img/icon/feature-1.png" alt="quality assurance icon" /></div>
                <div className="feature-content">
                  <h3 className="title">Quality Assurance</h3>
                  <p>Every funding solution is carefully evaluated to ensure compliance, eligibility, and long-term financial sustainability for your business.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 fade-top">
              <div className="feature-item">
                <div className="bg-img"><img src="assets/img/images/feature-img-2.png" alt="feature" /></div>
                <div className="icon"><img src="assets/img/icon/feature-2.png" alt="client satisfaction icon" /></div>
                <div className="feature-content">
                  <h3 className="title">Client Satisfaction</h3>
                  <p>We prioritize transparency, speed, and clarity, ensuring founders always understand their funding options and outcomes.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 fade-top">
              <div className="feature-item">
                <div className="bg-img"><img src="assets/img/images/feature-img-3.png" alt="feature" /></div>
                <div className="icon"><img src="assets/img/icon/process-2.png" alt="planning strategy icon" /></div>
                <div className="feature-content">
                  <h3 className="title">Planning &amp; Strategy</h3>
                  <p>Beyond funding, we help businesses plan capital utilization, repayment structures, and growth-ready financial strategies.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial-section pt-120 pb-120" data-background="assets/img/bg-img/testi-bg.png">
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
            pagination={{ clickable: true }}
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

      <section className="faq-section pt-120 pb-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="faq-content">
                <div className="section-heading mb-30">
                  <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />FREQUENTLY ASKED QUESTIONS</h4>
                  <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Why Should You Love To Work With Us?</h2>
                </div>
                <div className="faq-accordion fade-wrapper">
                  <div className="accordion" id="accordionExample">
                    <div className="accordion-item fade-top">
                      <h2 className="accordion-header" id="headingOne">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                          What sets StartupCredit apart from others?
                        </button>
                      </h2>
                      <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                          We combine deep knowledge of government schemes, MSME lending, and startup funding — all with hands-on support.
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item fade-top">
                      <h2 className="accordion-header" id="headingTwo">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                          How do you customize financing solutions for businesses?
                        </button>
                      </h2>
                      <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                          We evaluate your business model, eligibility, repayment capacity, and goals to match the most suitable funding structure — whether government scheme, institutional loan, or private capital.
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item fade-top">
                      <h2 className="accordion-header" id="headingThree">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                          What sets your consultancy apart from the industry?
                        </button>
                      </h2>
                      <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                          End-to-end handholding — from documentation to disbursement — with high success rate in government schemes and zero-hidden-fee approach.
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item fade-top">
                      <h2 className="accordion-header" id="headingFour">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                          Do you assist with documentation and compliance?
                        </button>
                      </h2>
                      <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                          Yes — complete support in preparing DPR, financial projections, application filing, and compliance with scheme guidelines.
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item mb-0 fade-top">
                      <h2 className="accordion-header" id="headingFive">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                          What type of Startups and Business do you work with?
                        </button>
                      </h2>
                      <div id="collapseFive" className="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                          Early-stage startups, DPIIT-recognized companies, MSMEs, manufacturing units, service-based businesses, tech ventures — across most sectors.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="faq-img img-reveal">
                <div className="img-overlay" />
                <img src="assets/img/images/faq-img.png" alt="business professional thinking at laptop" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default About
