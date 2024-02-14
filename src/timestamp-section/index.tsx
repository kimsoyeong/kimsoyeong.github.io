import React, { FunctionComponent } from 'react'
import './style.css'
// import SectionHeader from '../section-header'
// import IconButtonBar from '../icon-button-bar'

const TimeStampSection: FunctionComponent<{ timestamps: any; title: string }> =
  function ({ timestamps, title }) {
    if (!timestamps || timestamps.length < 2) return null
    return (
      <div className="section-inner">
        <h3 className="section-title">{title}</h3>
        {/* <SectionHeader title="Timestamps" /> */}
        <div className="section-content">
          {timestamps.map((timestamp: any, index: number) =>
            index === 0 ? null : (
              <div className="timestamp" key={index}>
                <li key={index}>
                  {timestamp.date}: {timestamp.activity}
                </li>
                {/* <div className="date">{timestamp.date}</div>
              <div className="activity">
                {timestamp.activity}&nbsp;
                {timestamp.links && <IconButtonBar links={timestamp.links} />}
              </div> */}
              </div>
            ),
          )}
        </div>
      </div>
    )
  }

export default TimeStampSection
