import { Link } from 'gatsby'
import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'

const Box = styled.div`
  display: flex;
  flex-direction: column;
  width: 50px;
  height: 50px;
  line-height: 50px;
  text-align: center;
  margin: 0 2px;
  padding: 0;
  border-radius: 10px;

  @media screen and (max-width: 576px) {
    width: 40px;
    height: 40px;
    line-height: 40px;
  }
`

const IconBox: FunctionComponent = function ({ title }) {
  return title === 'Portfolio' || title === 'Mail' ? (
    <a
      href={
        title === 'Portfolio'
          ? 'https://github.com/kimsoyeong'
          : 'mailto:soyeong@csap.snu.ac.kr'
      }
      target="_blank"
    >
      <Box>
        <img
          src={
            title === 'Portfolio'
              ? 'https://cdn.jim-nielsen.com/macos/512/github-desktop-2021-05-20.png'
              : 'https://preview.redd.it/izqwm1g21b751.png?auto=webp&s=da8f46dec79e38870efeac10d5a829e50792686b'
          }
        />
      </Box>
    </a>
  ) : (
    <Link to={title === 'Memo' ? '/about' : '/info'}>
      <Box style={title === 'Photo' ? { padding: '3px' } : null}>
        <img
          src={
            title === 'Finder'
              ? 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Finder_Icon_macOS_Big_Sur.png'
              : title === 'Launchpad'
              ? 'https://upload.wikimedia.org/wikipedia/it/5/57/Icona_Launchpad.png'
              : title === 'Memo'
              ? 'https://eshop.macsales.com/blog/wp-content/uploads/2020/12/Notes-Icon-Big-Sur.png'
              : title === 'Terminal'
              ? 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Terminalicon2.png'
              : title === 'Photobooth'
              ? 'https://help.apple.com/assets/61E899F78F0A0930525095E9/61E899F88F0A0930525095F0/en_US/cf5e7b842bc14056aa04fb60a2cd84e1.png'
              : title === 'Photo'
              ? 'https://help.apple.com/assets/6348318B9C14DE7E263A6023/6348319C9C14DE7E263A602B/en_US/b27be11281d58d9597fabdfcc67a3060.png'
              : 'https://help.apple.com/assets/635FFDD9F3522E368071002A/635FFDDBF3522E3680710032/en_US/14afc11a08e3fe617b2404ee08a0d0af.png'
            // 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Mac_App_Store_logo.png'
          }
        />
      </Box>
    </Link>
  )
}

export default IconBox
