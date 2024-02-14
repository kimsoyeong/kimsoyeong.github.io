import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'

const MemoHeader = styled.div`
  display: flex;
  background-color: '#FEFEFE';
  padding: 10px;
  color: black;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`

const MemoContent = styled.div`
  padding: 16px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`

const Title = styled.div`
  margin-top: 10px;
  margin-bottom: 16px;
  font-size: 42px;
  font-weight: 800;
  color: black;

  @media (max-width: 768px) {
    font-size: 32px;
  }

  @media (max-width: 576px) {
    margin-top: 0px;
    font-size: 28px;
  }
`

const SubTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: black;
  margin-top: 20px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    margin-top: 14px;
    font-size: 14px;
  }

  @media (max-width: 576px) {
    margin-top: 12px;
    font-size: 12px;
  }
`

const IntroText = styled.ul`
  font-size: 16px;
  font-weight: 400;
  color: black;
  margin-bottom: 10px;

  li {
    margin: 6px 24px;
  }

  @media (max-width: 768px) {
    font-size: 14px;

    li {
      margin: 4px 20px;
    }
  }

  @media (max-width: 576px) {
    font-size: 12px;
  }
`

const PS = styled.div`
  color: black;
  font-size: 14px;
  margin-top: 28px;
  margin-bottom: 10px;
  background-color: #f2f2f2;
  border-radius: 6px;
  padding: 10px 16px;
  vertical-align: middle;

  @media (max-width: 767.9px) {
    font-size: 10px;
    margin-top: 10px;
    margin-bottom: 0px;
  }
`

const Box = styled.div`
  border-radius: 15px;
  border: 0.1px solid #00000060;
  background-color: #fefefe;
  box-shadow: 4px 6px 20px 8px #00000036;
  margin: 120px 20px;
  padding: 8px 16px;
  z-index: 1;

  min-width: 300px;

  @media screen and (max-width: 767.9px) {
    margin: 10px auto;
    width: 300px;
    border-radius: 12px;
  }
`

const MemoBox: FunctionComponent = function () {
  return (
    <Box>
      <MemoHeader>
        <div style={{ display: 'flex' }}>
          <div
            style={{
              backgroundColor: '#FC5959',
              border: '0.5px solid #E94B4D',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              marginRight: '7px',
            }}
          ></div>
          <div
            style={{
              backgroundColor: '#FCBD29',
              border: '0.5px solid #F6BA2B',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              marginRight: '7px',
            }}
          ></div>
          <div
            style={{
              backgroundColor: '#36D141',
              border: '0.5px solid #32C438',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              marginRight: '7px',
            }}
          ></div>
        </div>
        <div
          style={{
            margin: '0 16px',
            textAlign: 'center',
          }}
        >
          Soyeong Kim
        </div>
      </MemoHeader>
      <MemoContent>
        <Title>Soyeong Kim</Title>
        <SubTitle>Interest</SubTitle>
        <IntroText>
          <li>AI/ML/DL</li>
          <li>Web/App development</li>
        </IntroText>
        <SubTitle>Language</SubTitle>
        <IntroText>
          <li>Python</li>
          <li>Java</li>
          <li>C++</li>
        </IntroText>
        <PS>Check my resume by clicking the memo app.</PS>
      </MemoContent>
    </Box>
  )
}

export default MemoBox
