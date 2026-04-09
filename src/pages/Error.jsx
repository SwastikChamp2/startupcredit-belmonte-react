import PageHeader from '../components/PageHeader'
import { Link } from 'react-router-dom'

function Error() {
  return (
    <>
      <PageHeader title="404 Error Page" breadcrumb="404 Error Page" />

      <section className="error-section pt-120 pb-120">
        <div className="container">
          <div className="error-content text-center">
            <img src="assets/img/images/error-img.png" alt="img" />
            <h2 className="text">Page Not Found</h2>
            <p className="mb-30">The page you are looking for was moved, removed, renamed <br />
              or never existed.
            </p>
            <Link to="/" className="bz-primary-btn">Back to home</Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Error
