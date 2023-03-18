import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import ProfileImage from 'components/Main/ProfileImage'
import IconBox from './IconBox'

const Background = styled.div`
  width: 100%;
  heihgt: 100vh;

  background-image: linear-gradient(60deg, #050122 0%, #050122 100%);
  background-image: url('https://user-images.githubusercontent.com/43427380/226113811-d75030e6-bf05-4e73-9d09-4f0ef22c051c.jpg');
  background-image: url('https://dynamicwallpaper.club/landing-vids/1.png');
  background-image: linear-gradient(
    190deg,
    #c4c4de 0%,
    #cd91b5 30%,
    #a331ce 60%,
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
  margin: 0 auto;

  @media (max-width: 768px) {
    width: 100%;
    height: 100vh;
    padding: 0 20px;
  }
`

const SubTitle = styled.div`
  font-size: 20px;
  font-weight: 400;
  color: black;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`

const Title = styled.div`
  margin-top: 5px;
  font-size: 35px;
  font-weight: 700;
  color: black;

  @media (max-width: 768px) {
    font-size: 25px;
  }
`

const Introduction: FunctionComponent = function () {
  return (
    <Background>
      <Wrapper>
        <ProfileImage />

        <div>
          <SubTitle>Nice to Meet You,</SubTitle>
          <Title>I'm Soyeong Kim.</Title>
        </div>
      </Wrapper>
      <div
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
    </Background>
  )
}

export default Introduction
