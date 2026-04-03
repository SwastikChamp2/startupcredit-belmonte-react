import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

function Home() {
  const [requestMsg, setRequestMsg] = useState('')

  const handleRequestSubmit = (e) => {
    e.preventDefault()
    setRequestMsg('Your request has been submitted successfully!')
    e.target.reset()
    setTimeout(() => setRequestMsg(''), 5000)
  }

  return (
    <>
  <section className="hero-section">
    <div className="hero-mask-img">
      <div className="overlay" />
      <div className="overlay-2" />
      <img src="assets/img/images/hero-img.png" alt="hero" />
    </div>
    <div className="shapes">
      <div className="shape shape-1"><img src="assets/img/shapes/hero-shape-1.png" alt="shape" /></div>
      <div className="shape shape-2"><img src="assets/img/shapes/hero-shape-2.png" alt="shape" /></div>
      <div className="shape shape-3"><img src="assets/img/shapes/hero-shape-3.png" alt="shape" /></div>
      <div className="shape shape-4"><img src="assets/img/shapes/hero-shape-4.png" alt="shape" /></div>
      <div className="round-shape" />
    </div>
    <div className="container">
      <div className="hero-wrap">
        <div className="hero-content">
          <div className="section-heading mb-40">
            <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />We're building Awesome brands</h4>
            <h2 className="section-title text-animation-effect">Building Smart <br />Business From <br />Scratch
            </h2>
            <p>We specialize in providing comprehensive solutions to help businesses tackle their most
              pressing issues.</p>
          </div>
          <div className="hero-btn-wrap">
            <Link to="/contact" className="bz-primary-btn">Contact With Us <i className="fas fa-arrow-right" /></Link>
            <Link to="/service" className="bz-primary-btn hero-btn">Our Services</Link>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* ./ hero-section */}
  <section className="about-section pt-120 pb-120">
    <div className="container">
      <div className="row align-items-center">
        <div className="col-lg-6 col-md-12">
          <div className="about-img-wrap">
            <div className="about-img img-reveal">
              <div className="img-overlay" />
              <img src="assets/img/images/about-img-1.png" alt="img" />
            </div>
            <div className="shape" />
          </div>
        </div>
        <div className="col-lg-6 col-md-12">
          <div className="about-content fade-wrapper">
            <div className="section-heading heading-2 mb-30">
              <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />About Our Company</h4>
              <h2 className="section-title" data-text-animation data-split="word" data-duration={1}>The Only
                Source of Knowledge is Experience</h2>
              <p className="fade-top">Appropriately empower dynamic leadership skills after business portals.
                Globally myocardinate interactive supply chains with distinctive quality vectors.</p>
            </div>
            <div className="about-items">
              <div className="about-item fade-top">
                <div className="icon"><img src="assets/img/icon/about-icon-1.png" alt="img" /></div>
                <div className="content">
                  <h4 className="title">Provide Skills <br />Services</h4>
                </div>
              </div>
              <div className="about-item fade-top">
                <div className="icon"><img src="assets/img/icon/about-icon-2.png" alt="img" /></div>
                <div className="content">
                  <h4 className="title">Urgent Support <br />For Clients</h4>
                </div>
              </div>
            </div>
            <div className="about-btn-wrap fade-top">
              <Link to="/contact" className="bz-primary-btn">Contact With Us<i className="fas fa-arrow-right" /></Link>
              <a href="tel:+58658645869" className="bz-transparent-btn"><i className="fas fa-phone-volume" />+
                586 5864 5869</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* ./ about-section */}
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
              <div className="icon-inner">
                <img src="assets/img/icon/counter-icon-1.png" alt="icon" />
              </div>
              <div className="shape" />
            </div>
            <div className="counter-content">
              <h3 className="title"><span className="odometer" data-count={858}>0</span></h3>
              <p>Projects Done</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="counter-item fade-top">
            <div className="icon">
              <div className="icon-inner">
                <img src="assets/img/icon/counter-icon-2.png" alt="icon" />
              </div>
              <div className="shape" />
            </div>
            <div className="counter-content">
              <h3 className="title"><span className="odometer" data-count={655}>0</span></h3>
              <p>Media Activities</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="counter-item fade-top">
            <div className="icon">
              <div className="icon-inner">
                <img src="assets/img/icon/counter-icon-3.png" alt="icon" />
              </div>
              <div className="shape" />
            </div>
            <div className="counter-content">
              <h3 className="title"><span className="odometer" data-count={567}>0</span></h3>
              <p>Skilled Experts</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="counter-item fade-top">
            <div className="icon">
              <div className="icon-inner">
                <img src="assets/img/icon/counter-icon-4.png" alt="icon" />
              </div>
              <div className="shape" />
            </div>
            <div className="counter-content">
              <h3 className="title"><span className="odometer" data-count="28k">0</span></h3>
              <p>Happy Clients</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* ./ counter-section */}
  <section className="service-section pt-120 pb-120" data-background="assets/img/bg-img/service-bg.png">
    <div className="container">
      <div className="section-heading text-center">
        <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />Our Services<span className="right-shape" /></h4>
        <h2 className="section-title" data-text-animation data-split="word" data-duration={1}>Service We Provide
        </h2>
      </div>
      <div className="row fade-wrapper gy-lg-0 gy-4 justify-content-center">
        <div className="col-lg-4 col-md-6 fade-top">
          <div className="service-item">
            <div className="icon"><img src="assets/img/icon/service-icon-1.png" alt="icon" /></div>
            <div className="service-content">
              <h3 className="title"><Link to="/service-details">Operations Optimization</Link></h3>
              <p>Your operations and processes are fundamental to your company's ability to deliver value
                to get you where you want to.</p>
              <Link to="/service-details" className="bz-primary-btn">Read More <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6 fade-top">
          <div className="service-item">
            <div className="icon"><img src="assets/img/icon/service-icon-2.png" alt="icon" /></div>
            <div className="service-content">
              <h3 className="title"><Link to="/service-details">Human Resources</Link></h3>
              <p>Your operations and processes are fundamental to your company's ability to deliver value
                to get you where you want to.</p>
              <Link to="/service-details" className="bz-primary-btn">Read More <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6 fade-top">
          <div className="service-item">
            <div className="icon"><img src="assets/img/icon/service-icon-3.png" alt="icon" /></div>
            <div className="service-content">
              <h3 className="title"><Link to="/service-details">Risk Management</Link></h3>
              <p>Your operations and processes are fundamental to your company's ability to deliver value
                to get you where you want to.</p>
              <Link to="/service-details" className="bz-primary-btn">Read More <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* ./ service-section */}
  <section className="content-section pt-120 pb-120">
    <div className="content-container">
      <div className="content-wrap pt-120 pb-120" data-background="assets/img/bg-img/content-bg.png">
        <div className="shapes">
          <div className="shape-1" />
          <div className="shape-2" />
        </div>
        <div className="content-box">
          <div className="section-heading mb-30">
            <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />Determination of our core team</h4>
            <h2 className="section-title" data-text-animation data-split="word" data-duration={1}>We Are
              Qualified In Every
              <br />Car Departments
            </h2>
          </div>
          <div className="content-tab">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">About Us</button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Our
                  Mission</button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact" type="button" role="tab" aria-controls="contact" aria-selected="false">Our
                  Vision</button>
              </li>
            </ul>
            <div className="tab-content" id="myTabContent">
              <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                <div className="tab-info">
                  <p>Nostra habitasse inceptos placerat vivamus vestibulum blandit odio dignissim
                    aliquet nunc taciti, cubilia aenean lobortis class sollicitudin conubia urna
                    acter elementum mauris porttitor mus commodo tortor.</p>
                  <div className="tab-progress">
                    <div className="progress">
                      <div className="progress-bar" role="progressbar" style={{width: '90%'}}>
                        <span>90%</span>
                      </div>
                    </div>
                    <h4 className="title">Engine Solution</h4>
                  </div>
                  <Link to="/contact" className="bz-primary-btn">Get a Quote</Link>
                </div>
              </div>
              <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                <div className="tab-info">
                  <p>Nostra habitasse inceptos placerat vivamus vestibulum blandit odio dignissim
                    aliquet nunc taciti, cubilia aenean lobortis class sollicitudin conubia urna
                    acter elementum mauris porttitor mus commodo tortor.</p>
                  <div className="tab-progress">
                    <div className="progress">
                      <div className="progress-bar" role="progressbar" style={{width: '80%'}}>
                        <span>80%</span>
                      </div>
                    </div>
                    <h4 className="title">Engine Solution</h4>
                  </div>
                  <Link to="/contact" className="bz-primary-btn">Get a Quote</Link>
                </div>
              </div>
              <div className="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
                <div className="tab-info">
                  <p>Nostra habitasse inceptos placerat vivamus vestibulum blandit odio dignissim
                    aliquet nunc taciti, cubilia aenean lobortis class sollicitudin conubia urna
                    acter elementum mauris porttitor mus commodo tortor.</p>
                  <div className="tab-progress">
                    <div className="progress">
                      <div className="progress-bar" role="progressbar" style={{width: '85%'}}>
                        <span>85%</span>
                      </div>
                    </div>
                    <h4 className="title">Engine Solution</h4>
                  </div>
                  <Link to="/contact" className="bz-primary-btn">Get a Quote</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* ./ content-section */}
  <section className="team-section pt-120 pb-120 fade-wrapper">
    <div className="bg-shape fade-right"><img src="assets/img/shapes/team-shape-1.png" alt="img" /></div>
    <div className="container">
      <div className="team-top">
        <div className="section-heading white-content">
          <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />Our Team Members</h4>
          <h2 className="section-title" data-text-animation data-split="word" data-duration={1}>Meet The Expert
            Team Members</h2>
        </div>
      </div>
    </div>
    <div className="team-wrap">
      <div className="row gy-lg-0 gy-4 fade-wrapper">
        {[
          { img: 'team-1.png', name: 'Markus Finland' },
          { img: 'team-2.png', name: 'Devon Lane' },
          { img: 'team-3.png', name: 'Viv Richards' },
          { img: 'team-4.png', name: 'John Smith' },
        ].map((member) => (
          <div className="col-lg-3 col-md-6 fade-top" key={member.name}>
            <div className="team-item">
              <div className="team-thumb">
                <img src={`assets/img/team/${member.img}`} alt="team" />
                <div className="shapes">
                  <div className="shape-1" />
                  <div className="shape-2" />
                </div>
              </div>
              <div className="team-content-wrap">
                <div className="team-content">
                  <h3 className="title"><Link to="/">{member.name}</Link></h3>
                  <span>Business Coach</span>
                </div>
                <div className="team-social">
                  <div className="expand">
                    <i className="fa-solid fa-share-nodes" />
                  </div>
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
  {/* ./ team-section */}
  <section className="project-section pt-120 pb-120">
    <div className="bg-shape" data-background="assets/img/bg-img/project-bg.png" />
    <div className="container">
      <div className="project-top heading-space">
        <div className="section-heading mb-0">
          <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />Our Projects</h4>
          <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Our Business
            Case Study</h2>
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
        <SwiperSlide>
          <div className="project-item">
            <div className="project-img">
              <div className="overlay" />
              <div className="overlay-2" />
              <img src="assets/img/project/prooject-1.png" alt="project" />
            </div>
            <div className="project-content">
              <h3 className="title"><Link to="/">Pro Business Solution</Link></h3>
              <span>Case Study, Growth</span>
              <p>Ornare etiam laoreet dictumst nisl quisque scelerisque cras ut porta interdum purus
                mattis iaculis litora turpis torquent posuere sodales himenaeos</p>
              <Link to="/" className="bz-primary-btn">View Project</Link>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="project-item">
            <div className="project-img">
              <div className="overlay" />
              <div className="overlay-2" />
              <img src="assets/img/project/prooject-2.png" alt="project" />
            </div>
            <div className="project-content">
              <h3 className="title"><Link to="/">Business Plan</Link></h3>
              <span>Case Study, Growth</span>
              <p>Ornare etiam laoreet dictumst nisl quisque scelerisque cras ut porta interdum purus
                mattis iaculis litora turpis torquent posuere sodales himenaeos</p>
              <Link to="/" className="bz-primary-btn">View Project</Link>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
      <div className="swiper-pagination" />
    </div>
  </section>
  {/* ./ project-section */}
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
        navigation={{
          nextEl: '.testi-section .swiper-prev',
          prevEl: '.testi-section .swiper-next',
        }}
        pagination={{ el: '.testimonial-section .swiper-pagination', clickable: true }}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 30 },
          767: { slidesPerView: 1, spaceBetween: 30 },
          1024: { slidesPerView: 2 },
        }}
      >
        {[
          { img: 'testi-author-1.png', name: 'Henry Oliver' },
          { img: 'testi-author-2.png', name: 'Thomas William' },
          { img: 'testi-author-1.png', name: 'Henry Oliver' },
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
  <section className="blog-section pt-120 pb-120 fade-wrapper">
    <div className="container">
      <div className="section-heading text-center">
        <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />News Blog</h4>
        <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Latest News &amp;
          Articles</h2>
      </div>
      <div className="row gy-4 justify-content-center">
        {[
          { img: 'post-1.jpg', title: 'Developer within team are responsible for creating' },
          { img: 'post-2.jpg', title: 'Insights from Top Business Consultancy Experts' },
          { img: 'post-3.jpg', title: 'How Business Consultancy Propels Companies...' },
        ].map((post) => (
          <div className="col-lg-4 col-md-6" key={post.img}>
            <div className="post-card fade-top">
              <div className="post-thumb">
                <img src={`assets/img/blog/${post.img}`} alt="post" />
              </div>
              <div className="post-content-wrap">
                <div className="post-content">
                  <ul className="post-meta">
                    <li><i className="fas fa-calendar" />24 Feb, 2024</li>
                    <li><i className="fas fa-user" />by admin</li>
                  </ul>
                  <h3 className="title"><Link to="/">{post.title}</Link></h3>
                </div>
                <div className="post-bottom">
                  <Link className="read-more" to="/">Read More<i className="fa-solid fa-chevrons-right" /></Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
  {/* ./ blog-section */}
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
                    <input type="text" name="phone" className="form-control" placeholder="Phone number*" />
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
                <button className="bz-primary-btn" type="submit">Send Request</button>
              </div>
            </form>
          </div>
        </div>
        <div className="col-md-6">
          <div className="request-img-wrap">
            <img className="men" src="assets/img/images/request-men.png" alt="men" />
            <img className="bg-img" src="assets/img/images/request-img.png" alt="img" />
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* ./ request-section */}
  <section className="sponsor-section pt-120 pb-120">
    <div className="container">
      <h3 className="sponsor-text-wrap">
        <span />
        <span className="sponsor-text">We Have THe 200+ Trusted Companies Who are trusting Bizan</span>
        <span />
      </h3>
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
        {[1, 2, 3, 4, 5].map((n) => (
          <SwiperSlide key={n}>
            <div className="sponsor-item text-center">
              <a href="#"><img src={`assets/img/sponsor/sponsor-${n}.png`} alt="sponsor" /></a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  </section>
    </>
  )
}

export default Home
