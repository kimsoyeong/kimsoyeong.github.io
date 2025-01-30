import styled from "@emotion/styled";
import "./style.css";
import "./Journal.css";

const Background = styled.div`
  width: 100%;
  heihgt: 100vh;

  background-image: linear-gradient(
    190deg,
    #c4c4de 0%,
    #cd91b5 40%,
    #a331ce 80%,
    #3a1791 100%
  );
  background-repeat: round;
  background-size: contain;

  @media (max-width: 768px) {
    height: 100vh;
    width: 100%;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column; /* row; */
  justify-content: center;
  align-items: flex-start;
  width: 768px;
  height: 100vh;
  padding: 40px 20px;
  margin: auto;

  @media (max-width: 767.9px) {
    width: 100%;
  }

  @media (max-width: 576px) {
    width: 100%;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 10px;
  }
`;

const pages = [
  {
    title: "Mt. Rigi",
    content: "This is the content for page 1.",
    image:
      "https://github.com/kimsoyeong/kimsoyeong.github.io/assets/43427380/f46c63ab-70a9-4f1f-adb8-83a4c32f8326",
  },
  {
    title: "Ruzerun?",
    content: "This is the content for page 1.",
    image:
      "https://github.com/kimsoyeong/kimsoyeong.github.io/assets/43427380/9ce4e297-87c3-4bbc-8e1c-21e3cc3950f8",
  },
  {
    title: "Sign in France",
    content: "1234",
    image:
      "https://github.com/kimsoyeong/kimsoyeong.github.io/assets/43427380/ea8c692d-b27e-4bac-988f-c4bf7fcf484c",
  },
  {
    title: "family V",
    content: "This is the content for page 2. HELLOOEWJFLKSVMSLVDSKDMVLSM",
    image:
      "https://github.com/kimsoyeong/kimsoyeong.github.io/assets/43427380/92d9b6c8-870b-46d9-b10e-51dc4fc0f94a",
  },
  {
    title: "Eiffel tower",
    content: "train2",
    image:
      "https://github.com/kimsoyeong/kimsoyeong.github.io/assets/43427380/99657601-3297-4f39-b4bf-05b4c4502eb6",
  },
  {
    title: "Eiffel tower 2",
    content: "train2",
    image:
      "https://github.com/kimsoyeong/kimsoyeong.github.io/assets/43427380/434fbb7c-20e7-41a8-a7c7-80e96404bca0",
  },
  {
    title: "Selfi with bro",
    content: "1234",
    image:
      "https://github.com/kimsoyeong/kimsoyeong.github.io/assets/43427380/2cc202d6-0143-4495-863b-f102c20355b4",
  },
  {
    title: "scope",
    content: "",
    image:
      "https://github.com/kimsoyeong/kimsoyeong.github.io/assets/43427380/67ac9519-c591-435b-9489-bb18348c7324",
  },
  {
    title: "Thank U",
    content: "This is last page of my journal.",
    image: "",
  },
  // Add more pages as needed
];

const Journal = ({}) => {
  return (
    <Background>
      <Wrapper>
        <h1 style={{ margin: "0 auto" }}>Journal</h1>

        <input type="checkbox" id="checkbox-cover" />
        <input type="checkbox" id="checkbox-page1" />
        <input type="checkbox" id="checkbox-page2" />
        <input type="checkbox" id="checkbox-page3" />
        <input type="checkbox" id="checkbox-page4" />
        <div className="book">
          {(() => {
            let coverJSX = [
              <div className="front-page">
                <img src="https://i.pinimg.com/originals/39/e1/02/39e102f45cd92ae81b9909544959afa5.jpg" />
                <label className="next" htmlFor="checkbox-cover"></label>
              </div>,
            ];
            let pagesJSX = [];
            let finalJSX = [];
            let idx = 1;
            for (let i = 0; i < pages.length; i += 1) {
              let page = pages[i];
              if (i === 0) {
                // first page: back-page of the cover
                coverJSX.push(
                  <div className="back-page">
                    {page.image === "" ? (
                      <div className="page-text">
                        <h2>{page.title}</h2>
                        <p>{page.content}</p>
                      </div>
                    ) : (
                      <img src={page.image} />
                    )}
                    <label className="prev" htmlFor="checkbox-cover"></label>
                  </div>
                );
              } else if (i === pages.length - 1) {
                // last page
                pagesJSX.push(
                  <div className="back-page">
                    {page.image === "" ? (
                      <div className="page-text last">
                        <h2>{page.title}</h2>
                        <p>{page.content}</p>
                      </div>
                    ) : (
                      <img src={page.image} />
                    )}

                    <label
                      className="prev"
                      htmlFor={"checkbox-page" + idx}
                    ></label>
                  </div>
                );
                idx += 1;
              } else if (i % 2 !== 0) {
                // right page
                pagesJSX.push(
                  <div className="front-page">
                    {page.image === "" ? (
                      <div className="page-text">
                        <h2>{page.title}</h2>
                        <p>{page.content}</p>
                      </div>
                    ) : (
                      <img src={page.image} />
                    )}

                    <label
                      className="next"
                      htmlFor={"checkbox-page" + idx}
                    ></label>
                  </div>
                );
              } else {
                // left page
                pagesJSX.push(
                  <div className="back-page">
                    {page.image === "" ? (
                      <div className="page-text">
                        <h2>{page.title}</h2>
                        <p>{page.content}</p>
                      </div>
                    ) : (
                      <img src={page.image} />
                    )}

                    <label
                      className="prev"
                      htmlFor={"checkbox-page" + idx}
                    ></label>
                  </div>
                );
                idx += 1;
              }
            }

            finalJSX.push(
              <div className="cover">
                {coverJSX[0]}
                {coverJSX[1]}
              </div>
            );

            for (let i = 0; i < pagesJSX.length; i += 2) {
              finalJSX.push(
                <div className="page" id={"page" + (i / 2 + 1)}>
                  {pagesJSX[i]}
                  {pagesJSX[i + 1]}
                </div>
              );
            }

            return finalJSX;
          })()}
          <div className="back-cover">{/* Not visible on screen */}</div>
        </div>
      </Wrapper>
    </Background>
  );
};

export default Journal;
