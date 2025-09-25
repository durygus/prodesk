import React, { useEffect, useRef } from 'react'

import $ from 'jquery'
import 'peity'
import PropTypes from 'prop-types'

export default function PeityLine ({ height, width, fill, stroke, values }) {
  const lineRef = useRef()
  useEffect(() => {
    if (lineRef.current && values && values.trim()) {
      // Validate values to prevent NaN errors
      const validValues = values.split(',').map(v => {
        const num = parseFloat(v.trim())
        return isNaN(num) ? 0 : num
      }).join(',')
      
      $(lineRef.current).peity('line', {
        height: isNaN(height) ? 28 : height,
        width: isNaN(width) ? 64 : width,
        fill,
        stroke
      })
    }
  }, [])

  return (
    <div>
      <span ref={lineRef}>{values}</span>
    </div>
  )
}

PeityLine.propTypes = {
  values: PropTypes.string.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  fill: PropTypes.string,
  stroke: PropTypes.string
}

PeityLine.defaultProps = {
  height: 28,
  width: 64,
  fill: '#d1e4f6',
  stroke: '#0288d1'
}
