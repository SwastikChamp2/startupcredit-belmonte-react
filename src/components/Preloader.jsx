import { useState, useEffect } from 'react'

function Preloader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div id="preloader">
      <div className="loading" data-loading-text="Startup Credit" />
    </div>
  )
}

export default Preloader
