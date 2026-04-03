import { Link } from 'react-router-dom'

function PageHeader({ title, breadcrumb }) {
  return (
    <section className="page-header">
  <div className="bg-img" data-background="assets/img/bg-img/page-header-bg.jpg" />
  <div className="overlay" />
  <div className="shapes">
    <div className="shape shape-1"><img src="assets/img/shapes/pager-header-shape-1.png" alt="shape" /></div>
    <div className="shape shape-2"><img src="assets/img/shapes/pager-header-shape-2.png" alt="shape" /></div>
  </div>
  <div className="container">
    <div className="page-header-content">
      <h1 className="title">{title}</h1>
      <h4 className="sub-title">
        <span className="home">
          <Link to="/">
            <span>Home</span>
          </Link>
        </span>
        <span className="icon">/</span>
        <span className="inner">
          <span>{breadcrumb}</span>
        </span>
      </h4>
    </div>
  </div>
</section>
  )
}

export default PageHeader
