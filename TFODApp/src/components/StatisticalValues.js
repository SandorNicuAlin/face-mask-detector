import React from 'react'
import "./StatisticalValues.css"

function StatisticalValues(props) {
    return (props.trigger) ? (
        <div className="statisticalvalues">
            <div className="statisticalvalues-inner">
              
               
                {props.children}
            </div>
        </div>
    ) : "";

}

export default StatisticalValues