import React, { FunctionComponent } from 'react'

const ContentItem: FunctionComponent = function ({ contents }) {
  return (
    <div className="section-inner" style={{ border: 'none', paddingTop: 0 }}>
      <div>
        <ol
          className="content-list"
          style={{
            listStyle: 'none',
            padding: 0,
            width: '100%',
          }}
        >
          {contents.map((content, index) =>
            index === 0 ? null : (
              <li
                className="content"
                key={index}
                style={{
                  padding: 0,
                  margin: '18px 0 0 0',
                  backgroundColor: 'white',
                  borderRadius: '15px',
                }}
              >
                <div style={{ padding: 0, margin: 0, display: 'flex' }}>
                  {content.thumbnailUrl ? (
                    <img
                      width="100%"
                      src={content.thumbnailUrl}
                      style={{
                        borderRadius: '15px',
                        minHeight: '100px',
                      }}
                    />
                  ) : null}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1rem',
                    color: 'black',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {content.title}
                  </span>
                  <p style={{ fontSize: '13px', fontWeight: '400' }}>
                    {content.description}
                  </p>
                </div>
                {/* <div className="techstack">
                  {content.techStack.map((tech, index) => (
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '400',
                        backgroundColor: 'rgba(204, 209, 223, 0.3)',
                        padding: '2px 8px',
                        margin: '4px 8px 8px 0',
                        borderRadius: '0.4em',
                      }}
                    >
                      {tech}
                    </div>
                  ))}
                </div> */}
              </li>
            ),
          )}
        </ol>
      </div>
    </div>
  )
}

export default ContentItem
