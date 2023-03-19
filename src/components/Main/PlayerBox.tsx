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
  'https://user-images.githubusercontent.com/43427380/226154106-3932e0cb-267d-451e-981e-76ef6daa3625.png'

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
`
const PlayerWrapper = styled.div`
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 8px 0;

  @media (max-width: 768px) {
  }
`

const PlayerBox: FunctionComponent = function () {
  return (
    <div
      style={{
        borderRadius: '0.7rem',
        border: '0.1px solid #00000090',
        backgroundColor: '#FEFEFE',
        boxShadow: '4px 6px 20px 8px #00000036',
      }}
    >
      <ProfileImageWrapper src={PROFILE_IMAGE_LINK} alt="Profile Image" />
      <div
        className="player-top"
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
          margin: '5px 0 0 0',
          color: '#00000080',
          fontSize: '11px',
        }}
      >
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
      </div>
      <PlayerWrapper>
        <div
          className="player-bar"
          style={{
            backgroundColor: '#BABABA',
            width: '80%',
            height: '4.4px',
            borderRadius: '5px',
            marginRight: '-8px',
          }}
        >
          <div
            style={{
              backgroundColor: '#555555',
              width: '24%',
              height: '4.4px',
              borderRadius: '5px',
            }}
          ></div>
        </div>
        <div
          style={{
            position: 'relative',
            backgroundColor: '#555555',
            width: '7px',
            height: '16px',
            borderRadius: '5px',
            border: '1px solid #E9E9E9',
            left: '-60%',
          }}
        ></div>
      </PlayerWrapper>
      <div
        className="player-bottom"
        style={{
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'space-evenly',
          verticalAlign: 'tex-bottom',
          marginBottom: '16px',
        }}
      >
        <div>
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

        <div
          style={{
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'space-evenly',
            width: '38%',
          }}
        >
          <FaBackward color="#00000080" size={20} />
          <FaPlay color="#00000080" size={20} />
          <FaForward color="#00000080" size={20} />
        </div>

        <div>
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
      </div>
    </div>
  )
}

export default PlayerBox
