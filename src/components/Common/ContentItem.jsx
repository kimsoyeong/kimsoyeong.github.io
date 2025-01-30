const ContentItem = ({ contents }) => {
  return (
    <div className="section-inner" style={{ border: "none", paddingTop: 0 }}>
      <div>
        <ol
          className="content-list"
          style={{
            listStyle: "none",
            padding: 0,
            width: "100%",
          }}
        >
          {contents.map((content, index) =>
            index === 0 ? null : (
              <li
                className="content"
                key={index}
                style={{
                  padding: 0,
                  margin: "18px 0 0 0",
                  backgroundColor: "white",
                  borderRadius: "15px",
                }}
              >
                <div style={{ padding: 0, margin: 0, display: "flex" }}>
                  {content.thumbnailUrl ? (
                    <img
                      width="100%"
                      src={content.thumbnailUrl}
                      style={{
                        borderRadius: "15px",
                        minHeight: "100px",
                      }}
                    />
                  ) : null}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "1rem",
                    color: "black",
                  }}
                >
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {content.title}
                  </span>
                  <p style={{ fontSize: "13px", fontWeight: "400" }}>
                    {content.description}
                  </p>
                </div>
              </li>
            )
          )}
        </ol>
      </div>
    </div>
  );
};

export default ContentItem;
