import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import PlayerBox from 'components/Main/PlayerBox'
import IconBox from './IconBox'
import MemoBox from './MemoBox'

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
  color: #ffffff;
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

  @media (max-width: 768px) {
    width: 100%;
    height: 100vh;
  }
`

const Introduction: FunctionComponent = function () {
  return (
    <Background>
      <Wrapper>
        <PlayerBox />
        <MemoBox />
        <div
          className="bottom-navbar"
          style={{
            display: 'flex',
            justifyContent: 'center',
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translate(-50%, 0)',
            textAlign: 'center',
            paddingLeft: '12px',
            paddingRight: '12px',
            height: '70px',
            color: 'black',
            fontWeight: '600',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '20px',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconBox title={'Finder'} />
            <IconBox title={'Launchpad'} />
            <IconBox title={'Mail'} />
            <IconBox title={'Memo'} />
            <IconBox title={'Terminal'} />
            <IconBox title={'Portfolio'} />
            <IconBox title={'Appstore'} />
          </div>
        </div>
      </Wrapper>
    </Background>
  )
}

export default Introduction
