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
              <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />About Our Company</h4>
              <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>
                Inspiring Tech Needs for Business</h2>
            </div>
            <p className="fade-top">Dynamically monetize enabled processes through based action items.
              Authoritatively grow goal is oriented markets through ompletely generate technically sound
              content without robust users.</p>
            <div className="about-contact-items fade-top">
              <div className="about-contact">
                <div className="icon"><i className="fa fa-phone" /></div>
                <div className="content">
                  <span>Call To Ask Any Queary</span>
                  <a href="tel:+25821562154">+(258) 2156 2154</a>
                </div>
              </div>
              <div className="about-author">
                <img src="assets/img/images/about-author.png" alt="img" />
                <h4 className="name"><span>Founder &amp; CEO</span>Julia Lopez</h4>
              </div>
            </div>
            <div className="about-btn-wrap fade-top">
              <a href="#" className="bz-primary-btn about-btn">Read Details <i className="fa fa-arrow-right" /></a>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-md-12">
          <div className="about-img-wrap-4 fade-top">
            <div className="about-img img-1">
              <img src="assets/img/images/about-img-6.png" alt="about" />
            </div>
            <div className="about-img img-2">
              <img src="assets/img/images/about-img-7.png" alt="about" />
            </div>
            <div className="about-counter">
              <div className="shape"><img src="assets/img/shapes/about-counter-shape.png" alt="shape" /></div>
              <h3 className="title"><span className="odometer" data-count={1589}>0</span></h3>
              <p>Successful Query</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* ./ about-section */}
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
          <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />About Our Company</h4>
          <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Revolutionize
            your digital presence with our strategic services</h2>
        </div>
        <Link to="/about" className="bz-primary-btn">Read Details <i className="fa fa-arrow-right" /></Link>
      </div>
    </div>
  </section>
  {/* ./ about-cta */}
  <section className="feature-section pt-120 pb-120">
    <div className="container">
      <div className="section-heading">
        <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />Our Features</h4>
        <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Unique Features
          We Provide</h2>
      </div>
      <div className="row gy-lg-0 gy-4 justify-content-center fade-wrapper">
        <div className="col-lg-4 col-md-6 fade-top">
          <div className="feature-item">
            <div className="bg-img"><img src="assets/img/images/feature-img-1.png" alt="feature" /></div>
            <div className="icon"><img src="assets/img/icon/feature-1.png" alt="feature" /></div>
            <div className="feature-content">
              <h3 className="title">Quality Assurance</h3>
              <p>Cardinate premier technology without sustainable leadership work...</p>
              <Link to="/service-details" className="read-more">Read Details <i className="fa fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6 fade-top">
          <div className="feature-item">
            <div className="bg-img"><img src="assets/img/images/feature-img-2.png" alt="feature" /></div>
            <div className="icon"><img src="assets/img/icon/feature-2.png" alt="feature" /></div>
            <div className="feature-content">
              <h3 className="title">Clients Satisfaction</h3>
              <p>Cardinate premier technology without sustainable leadership work...</p>
              <Link to="/service-details" className="read-more">Read Details <i className="fa fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6 fade-top">
          <div className="feature-item">
            <div className="bg-img"><img src="assets/img/images/feature-img-1.png" alt="feature" /></div>
            <div className="icon"><img src="assets/img/icon/process-2.png" alt="feature" /></div>
            <div className="feature-content">
              <h3 className="title">Planning &amp; Strategy</h3>
              <p>Cardinate premier technology without sustainable leadership work...</p>
              <Link to="/service-details" className="read-more">Read Details <i className="fa fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* ./ feature-section */}
  <section className="testimonial-section pt-120 pb-120" data-background="assets/img/bg-img/testi-bg.png">
    <div className="container">
      <div className="section-heading text-center">
        <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />Client's Feedbacks</h4>
        <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>What Our
          Customers Have to Say</h2>
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
          { img: 'testi-author-1.png', name: 'Henry Oliver' },
          { img: 'testi-author-2.png', name: 'Thomas William' },
        ].map((author, i) => (
          <SwiperSlide key={i}>
            <div className="testi-item">
              <div className="testi-top">
                <div className="testi-author">
                  <img src={`assets/img/images/${author.img}`} alt="img" />
                  <h4 className="name">{author.name} <span>IT Customer</span></h4>
                </div>
                <div className="quote"><img src="assets/img/icon/quote.png" alt="quote" /></div>
              </div>
              <p>"Quickly formulate high yield web services before functional process improvements enable
                premier with e-business customer service."</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="swiper-pagination" />
    </div>
  </section>
  {/* ./ testimonial-section */}
  <section className="faq-section pt-120 pb-120">
    <div className="container">
      <div className="row">
        <div className="col-lg-6">
          <div className="faq-content">
            <div className="section-heading mb-30">
              <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />Frequently Asked Questions</h4>
              <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Why
                Should You Love To Work With Us?</h2>
            </div>
            <div className="faq-accordion fade-wrapper">
              <div className="accordion" id="accordionExample">
                <div className="accordion-item fade-top">
                  <h2 className="accordion-header" id="headingOne">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                      Sets your company apart from others in the industry
                    </button>
                  </h2>
                  <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                      Global business consultancies also offer a range of specialized solutions
                      tailored to the unique needs of multinational...
                    </div>
                  </div>
                </div>
                <div className="accordion-item fade-top">
                  <h2 className="accordion-header" id="headingTwo">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                      How do you customize your solutions to meet needs?
                    </button>
                  </h2>
                  <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                      Global business consultancies also offer a range of specialized solutions
                      tailored to the unique needs of multinational...
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
                      Global business consultancies also offer a range of specialized solutions
                      tailored to the unique needs of multinational...
                    </div>
                  </div>
                </div>
                <div className="accordion-item fade-top">
                  <h2 className="accordion-header" id="headingFour">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                      Can you provide references or client testimonials?
                    </button>
                  </h2>
                  <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                      Global business consultancies also offer a range of specialized solutions
                      tailored to the unique needs of multinational...
                    </div>
                  </div>
                </div>
                <div className="accordion-item mb-0 fade-top">
                  <h2 className="accordion-header" id="headingFive">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                      Do you measure the consultancy engagements?
                    </button>
                  </h2>
                  <div id="collapseFive" className="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                      Global business consultancies also offer a range of specialized solutions
                      tailored to the unique needs of multinational...
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
            <img src="assets/img/images/faq-img.png" alt="faq" />
          </div>
        </div>
      </div>
    </div>
  </section>
    </>
  )
}

export default About
