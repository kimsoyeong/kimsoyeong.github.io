import React, { FunctionComponent } from 'react'
import './style.css'
// import SectionHeader from '../section-header'
// import IconButtonBar from '../icon-button-bar'

const AwardsSection: FunctionComponent = function ({ awards }) {
  if (!awards || awards.length < 2) return null
  return (
    <div className="section-inner">
      <h3 className="section-title">Awards</h3>
      <div className="section-content">
        <ol className="item-text" style={{ listStyle: 'none' }}>
          {awards.map((award, index) =>
            index === 0 ? null : (
              <li className="award" key={index}>
                <div className="title" style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {award.title}
                  </span>
                </div>

                <div className="host">
                  <span style={{ fontSize: '13px', fontWeight: '400' }}>
                    {award.host}
                  </span>
                </div>
                <div className="date">
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '400',
                      color: 'gray',
                      marginTop: '8px',
                    }}
                  >
                    {award.date}
                  </span>
                </div>
                <p
                  className="desc"
                  style={{ fontSize: '13px', fontWeight: '400' }}
                >
                  {award.description}
                </p>
              </li>
            ),
          )}
        </ol>
      </div>
    </div>
  )
}

export default AwardsSection
