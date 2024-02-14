import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { BsChatLeftQuote, BsThreeDots } from 'react-icons/bs'
import {
  FaBackward,
  FaPlay,
  FaForward,
  FaVolumeUp,
  FaListUl,
} from 'react-icons/fa'

// 자신이 원하는 프로필 이미지 링크로 설정해주세요.
const PROFILE_IMAGE_LINK =
  'https://user-images.githubusercontent.com/43427380/227985376-c16a5aba-73be-40a2-ae03-553d41151c2c.png'

const ProfileImageWrapper = styled.img`
  width: 300px;
  height: 300px;
  margin-bottom: 0;
  border-radius: 0.7rem;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;

  @media (max-width: 768px) {
    width: 300px;
    height: 300px;
  }

  @media (max-width: 576px) {
    border-radius: 0.7rem;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    width: 120px;
    height: 120px;
  }
`
const PlayerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 8px 0;

  .player-bar {
    background-color: #bababa;
    width: 80%;
    height: 4.4px;
    border-radius: 5px;
    margin-right: -8px;

    div {
      background-color: #555555;
      width: 24%;
      height: 4.4px;
      border-radius: 5px;
    }
  }

  .bar-current {
    position: relative;
    background-color: #555555;
    width: 7px;
    height: 16px;
    border-radius: 5px;
    border: 1px solid #fff;
    left: -60%;
  }

  @media (max-width: 576px) {
    .player-bar {
      width: 100%;

      div {
        width: 35%;
      }
    }
  }
`

const Box = styled.div`
  border-radius: 0.7rem;
  border: 0.1px solid #00000090;
  background-color: #fefefe;
  box-shadow: 4px 6px 20px 8px #00000036;

  z-index: 1;

  @media (max-width: 767.9px) {
    margin: 8px auto;
    width: 300px;
  }

  @media (max-width: 576px) {
    display: flex;
  }
`
const PlayerTop = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 4px 0 0 0;
  color: #00000080;
  font-size: 11px;

  @media (max-width: 576px) {
    justify-content: space-between;
    margin: 0;
    font-size: 8px;
  }
`

const PlayerBottom = styled.div`
  text-align: center;
  display: flex;
  justify-content: space-evenly;
  vertical-align: middle;
  margin-bottom: 16px;

  .bottom-center {
    text-align: center;
    display: flex;
    justify-content: space-evenly;
    width: 38%;
    margin: auto 0;
  }

  .bottom-top,
  .bottom-bottom {
    display: flex;
    margin: auto 0;
  }

  @media (max-width: 576px) {
    margin: auto;
    justify-content: space-between;

    .bottom-top {
      height: 10px;
      display: flex;
      margin: auto 0;

      svg {
        width: 10px;
        height: 10px;
      }
    }

    .bottom-bottom {
      height: 10px;
      display: flex;
      margin: auto 0;

      svg {
        width: 9px;
        height: 9px;
      }
    }

    .bottom-center {
      text-align: center;
      display: flex;
      margin: auto 0;

      justify-content: space-evenly;
      height: 12px;
      width: 60px;

      svg {
        width: 12px;
        height: 12px;
      }
    }
  }
`

const PlayerContent = styled.div`
  justify-content: center;
  align-items: center;
  margin: auto;

  @media (max-width: 576px) {
    width: 140px;
  }
`

const PlayerBox: FunctionComponent = function () {
  return (
    <Box>
      <ProfileImageWrapper src={PROFILE_IMAGE_LINK} alt="Profile Image" />
      <PlayerContent>
        <PlayerTop>
          <div
            style={{
              textAlign: 'center',
              fontWeight: '400',
            }}
          >
            0:57
          </div>
          <div
            style={{
              textAlign: 'center',
            }}
          >
            <span style={{ fontWeight: '700' }}>Soyang</span> log
          </div>
          <div
            style={{
              textAlign: 'center',
              fontWeight: '400',
            }}
          >
            -2:40
          </div>
        </PlayerTop>
        <PlayerWrapper>
          <div className="player-bar">
            <div></div>
          </div>
          <div className="bar-current"></div>
        </PlayerWrapper>
        <PlayerBottom className="player-bottom">
          <div className="bottom-top">
            <FaVolumeUp
              color="#00000080"
              size={12}
              style={{ marginRight: '6px', verticalAlign: 'middle' }}
            />
            <BsThreeDots
              color="#00000080"
              size={12}
              style={{ verticalAlign: 'middle' }}
            />
          </div>

          <div className="bottom-center">
            <FaBackward color="#00000080" size={20} />
            <FaPlay color="#00000080" size={20} />
            <FaForward color="#00000080" size={20} />
          </div>

          <div className="bottom-bottom">
            <BsChatLeftQuote
              color="#00000080"
              size={12}
              style={{ marginRight: '6px', verticalAlign: 'middle' }}
            />
            <FaListUl
              color="#00000080"
              size={12}
              style={{ verticalAlign: 'middle' }}
            />
          </div>
        </PlayerBottom>
      </PlayerContent>
    </Box>
  )
}

export default PlayerBox
