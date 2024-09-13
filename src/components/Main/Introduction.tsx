import React, { FunctionComponent, useState } from 'react'
import styled from '@emotion/styled'
import PlayerBox from 'components/Main/PlayerBox'
import IconBox from './IconBox'
import MemoBox from './MemoBox'
import WindowBox from 'components/Common/WindowBox'
import Terminal from 'components/Common/Terminal'
import BannerBox from 'components/Common/BannerBox'

const Background = styled.div`
  width: 100%;
  heihgt: 100vh;

  // mac style (violet)
  background-image: linear-gradient(
    190deg,
    #c4c4de 0%,
    #cd91b5 40%,
    #a331ce 80%,
    #3a1791 100%
  );
  // ipad style (skyblue)
  background-image: radial-gradient(
    circle,
    #559aff 0%,
    #a9d9fd 25%,
    #f5fbff 60%
  );
  background-repeat: round;
  background-size: contain;
  color: #ffffff;

  @media (max-width: 768px) {
    height: 100vh;
    width: 100%;
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
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
`

const BottomNavbar = styled.div`
  display: flex;
  justify-content: center;
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translate(-50%, 0);
  text-align: center;
  padding-left: 12px;
  padding-right: 12px;
  height: 70px;
  color: black;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  z-index: 2;

  @media screen and (max-width: 576px) {
    padding-left: 8px;
    padding-right: 8px;
    height: 56px;
    border-radius: 16px;
  }
`

const Introduction: FunctionComponent<{ projects: any }> = function ({
  projects,
}) {
  const [windowVisible, setWindowVisible] = useState(false)
  const [terminalVisible, setTerminalVisible] = useState(false)

  const showWindowBox = () => {
    setWindowVisible(!windowVisible)
  }

  const showTerminal = () => {
    setTerminalVisible(!terminalVisible)
  }

  return (
    <Background>
      <Wrapper>
        <PlayerBox />
        <MemoBox />
        <BannerBox />
        {/* Bottom menu bar */}
        <BottomNavbar>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconBox title={'Finder'} func={showWindowBox} />
            <IconBox title={'Launchpad'} />
            <IconBox title={'Journal'} />
            <IconBox title={'Mail'} />
            <IconBox title={'Memo'} />
            <IconBox title={'Terminal'} func={showTerminal} />
            <IconBox title={'Portfolio'} />
            {/* <IconBox title={'Appstore'} /> */}
          </div>
        </BottomNavbar>

        {windowVisible ? (
          <WindowBox
            title={'Project Finder'}
            projects={projects}
            func={showWindowBox}
          />
        ) : null}

        {terminalVisible ? <Terminal func={showTerminal} /> : null}
      </Wrapper>
    </Background>
  )
}

export default Introduction
