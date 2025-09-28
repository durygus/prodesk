import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

// d3 доступен глобально через window.d3
// MG доступен глобально через window.MG

const noDataDiv = <div className='no-data-available-text'>No Data Available</div>

export default function MGraph (props) {
  const graphRef = useRef()
  let graphParams = {}

  useEffect(() => {
    if (props.data && graphRef.current && props.data.length > 0) {
      graphRef.current.innerHTML = ''
      
      // Validate data to prevent NaN errors
      const validData = props.data.filter(item => 
        item && 
        !isNaN(parseFloat(item[props.y_accessor])) && 
        item[props.x_accessor]
      )
      
      if (validData.length === 0) {
        graphRef.current.innerHTML = '<div class="no-data-available-text">No Valid Data Available</div>'
        return
      }
      
      graphParams = {
        full_width: props.fullWidth,
        height: isNaN(props.height) ? 200 : props.height,
        x_accessor: props.x_accessor,
        y_accessor: props.y_accessor,
        y_extended_ticks: props.y_extended_ticks,
        show_tooltips: props.showTooltips,
        aggregate_rollover: props.aggregate_rollover,
        transition_on_update: props.transition_on_update,
        colors: props.colors,
        target: graphRef.current
      }
      if (props.area) graphParams.area = [1]

      graphParams.data = window.MG.convert.date(validData, 'date')
      window.MG.data_graphic(graphParams)
    }
  }, [props.data])

  return <div ref={graphRef}>{props.data && props.data.length < 1 && noDataDiv}</div>
}

MGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  fullWidth: PropTypes.bool,
  height: PropTypes.number,
  area: PropTypes.bool,
  x_accessor: PropTypes.string,
  y_accessor: PropTypes.string,
  y_extended_ticks: PropTypes.bool,
  showTooltips: PropTypes.bool,
  aggregate_rollover: PropTypes.bool,
  transition_on_update: PropTypes.bool,
  colors: PropTypes.arrayOf(PropTypes.string)
}

MGraph.defaultProps = {
  fullWidth: true,
  area: true,
  y_extended_ticks: true,
  showTooltips: false,
  aggregate_rollover: true,
  transition_on_update: false,
  colors: ['#2196f3']
}
