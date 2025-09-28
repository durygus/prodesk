import React, { useEffect, useRef } from 'react'

// $ доступен глобально через window.$
import 'peity'
import PropTypes from 'prop-types'

export default function PeityBar (props) {
  const barRef = useRef()

  useEffect(() => {
    if (barRef.current && props.values && props.values.trim()) {
      // Validate values to prevent NaN errors
      const validValues = props.values.split(',').map(v => {
        const num = parseFloat(v.trim())
        return isNaN(num) ? 0 : num
      }).join(',')
      
      $(barRef.current).peity('bar', {
        height: isNaN(props.height) ? 28 : props.height,
        width: isNaN(props.width) ? 48 : props.width,
        fill: props.fill,
        padding: isNaN(props.padding) ? 0.2 : props.padding
      })
    }
  }, [])

  return (
    <div>
      <span ref={barRef}>{props.values}</span>
    </div>
  )
}

PeityBar.propTypes = {
  values: PropTypes.string.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  fill: PropTypes.arrayOf(PropTypes.string),
  padding: PropTypes.number
}

PeityBar.defaultProps = {
  height: 28,
  width: 48,
  fill: ['#e74c3c'],
  padding: 0.2
}
