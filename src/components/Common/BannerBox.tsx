import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'

const Window = styled.div`
  position: absolute;
  bottom: 40px;
  top: 58%;
  left: 28%;
  max-width: 1000px;
  max-height: 650px;
  // transform: translate(40%, 0%);

  display: flex;
  flex-direction: column;
  box-shadow: 0 22px 70px 4px rgba(0, 0, 0, 0.56);
  overflow: hidden;

  height: 28vh;
  max-width: 1000px;
  min-width: 300px;
  max-height: 650px;

  color: black;
  font-weight: bold;
  border-radius: 15px;

  @media screen and (max-width: 576px) {
    position: relative;
    top: 0;
    left: 0;
    margin: 8px auto;

    width: 300px;
    border-radius: 12px;
  }
`
const WindowHeader = styled.div`
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  width: 100%;
  height: 2.8rem;
  padding: 14px 24px 0 24px;

  background-color: rgba(239, 242, 245, 0.75);
  backdrop-filter: blur(16px);

  div {
    display: flex;

    .color-button {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 7px;
    }

    .red {
      background-color: #fc5959;
      border: 0.5px solid #e94b4d;
    }

    .yellow {
      background-color: #fcbd29;
      border: 0.5px solid #f6ba2b;
    }

    .green {
      background-color: #36d141;
      border: 0.5px solid #32c438;
    }
  }
`

const WindowContent = styled.div`
  float: none;
  overflow-y: auto;
  width: 100%;
  height: 100%;
  background-color: #eff2f5;
  overflow-y: hidden;
  padding: 0;

  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
`

const BannerBox: FunctionComponent = function ({}) {
  return (
    <Window>
      <WindowHeader className="window_header">
        <div>
          <div className="color-button red"></div>
          <div className="color-button yellow"></div>
          <div className="color-button green"></div>
        </div>
      </WindowHeader>
      <WindowContent className="window_content">
        <img
          src="https://65.media.tumblr.com/e9e2199e776384ce5ccfe822d76cc999/tumblr_inline_o675xcrdxq1u6iccj_500.gif"
          style={{ width: '100%', height: '100%' }}
        />
      </WindowContent>
    </Window>
  )
}

export default BannerBox
