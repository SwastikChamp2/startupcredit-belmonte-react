import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import RequireAuth from '../components/RequireAuth'
import SubmissionModal from '../components/SubmissionModal'
import { useAuth } from '../hooks/useAuth'
import { submitTruckInquiry } from '../services/formsApi'

const vehicleModels = ['Ashok Layland', 'Bharat Benz', 'Eicher', 'Mahindra', 'Tata']
const containerSizes = ['17 Feet', '20 Feet', '22 Feet', '24 Feet', '26 Feet', '28 Feet', '30 Feet', '32 Feet']
const reeferUnits = ['Carrier', 'Thermo King']
const tyreCounts = [6, 10, 12, 14, 16]

function BuyTruck() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user?.name])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMsg('')
    const form = event.currentTarget
    const formData = new FormData(form)
    setSubmitting(true)

    try {
      await submitTruckInquiry({
        companyName: formData.get('companyName')?.toString() || '',
        name,
        email: user?.email || '',
        countryCode: user?.countryCode || '',
        phoneNumber: user?.phoneNumber || '',
        vehicleModel: formData.get('vehicleModel')?.toString() || '',
        reeferContainerSize: formData.get('reeferContainerSize')?.toString() || '',
        reeferUnit: formData.get('reeferUnit')?.toString() || '',
        temperature: formData.get('temperature')?.toString() || '',
        numberOfTyres: formData.get('numberOfTyres')?.toString() || '',
        vehicleQuantity: formData.get('vehicleQuantity')?.toString() || '',
      })
      form.reset()
      setName(user?.name || '')
      setShowModal(true)
    } catch (err) {
      setErrorMsg(err?.message || 'Could not submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Buy Truck" breadcrumb="Buy Truck" />
      <RequireAuth
        title="Login to submit your truck inquiry"
        message="Please log in or create an account to submit your truck requirements. Your contact details will be added from your profile."
      >
        <section className="contact-section pt-130 pb-130">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="blog-contact-form">
                  <h2 className="title mb-0">Truck Information</h2>
                  <p className="mb-30 mt-10">Share your requirements and our team will get in touch with you.</p>
                  <div className="request-form">
                    <SubmissionModal
                      isOpen={showModal}
                      onClose={() => setShowModal(false)}
                      title="Inquiry Received!"
                      message="Your truck inquiry has been submitted successfully. Our team will review your requirements and get in touch with you."
                    />
                    {errorMsg && <div className="alert alert-danger mb-3">{errorMsg}</div>}
                    <form onSubmit={handleSubmit} className="form-horizontal">
                      <div className="form-group row">
                        <div className="col-md-6">
                          <div className="form-item">
                            <input name="companyName" type="text" className="form-control" placeholder="Company Name" required />
                            <div className="icon"><i className="fas fa-building" /></div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-item">
                            <input
                              name="name"
                              type="text"
                              className="form-control"
                              placeholder="Name"
                              value={name}
                              onChange={(event) => setName(event.target.value)}
                              required
                            />
                            <div className="icon"><i className="fas fa-user" /></div>
                          </div>
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-md-6">
                          <div className="form-item">
                            <select name="vehicleModel" className="form-control" defaultValue="" required>
                              <option value="">Select Vehicle Model</option>
                              {vehicleModels.map((model) => <option key={model} value={model}>{model}</option>)}
                            </select>
                            <div className="icon"><i className="fas fa-truck" /></div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-item">
                            <select name="reeferContainerSize" className="form-control" defaultValue="" required>
                              <option value="">Select Reefer Container Size</option>
                              {containerSizes.map((size) => <option key={size} value={size}>{size}</option>)}
                            </select>
                            <div className="icon"><i className="fas fa-ruler-horizontal" /></div>
                          </div>
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-md-6">
                          <div className="form-item">
                            <select name="reeferUnit" className="form-control" defaultValue="" required>
                              <option value="">Select Reefer Unit</option>
                              {reeferUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                            <div className="icon"><i className="fas fa-snowflake" /></div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-item">
                            <input name="temperature" type="number" step="any" className="form-control" placeholder="Temperature in Celcius" required />
                            <div className="icon"><i className="fas fa-temperature-low" /></div>
                          </div>
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-md-6">
                          <div className="form-item">
                            <select name="numberOfTyres" className="form-control" defaultValue="" required>
                              <option value="">Select Number of Tyres</option>
                              {tyreCounts.map((count) => <option key={count} value={count}>{count}</option>)}
                            </select>
                            <div className="icon"><i className="fas fa-circle" /></div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-item">
                            <input name="vehicleQuantity" type="number" min="1" step="1" className="form-control" placeholder="Vehicle Quantity" required />
                            <div className="icon"><i className="fas fa-boxes" /></div>
                          </div>
                        </div>
                      </div>
                      <div className="submit-btn">
                        <button className="bz-primary-btn" type="submit" disabled={submitting}>
                          {submitting ? 'SUBMITTING...' : 'SUBMIT INQUIRY'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RequireAuth>
    </>
  )
}

export default BuyTruck
