import { Link } from 'gatsby'
import React, { FunctionComponent } from 'react'
import './IconBox.css'

const IconBox: FunctionComponent = function ({ title }) {
  return (
    <Link to="/about">
      <div className="box">
        <img
          src={
            title === 'Finder'
              ? 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Finder_Icon_macOS_Big_Sur.png'
              : title === 'Launchpad'
              ? 'https://upload.wikimedia.org/wikipedia/it/5/57/Icona_Launchpad.png'
              : title === 'Mail'
              ? 'https://preview.redd.it/izqwm1g21b751.png?auto=webp&s=da8f46dec79e38870efeac10d5a829e50792686b'
              : title === 'Memo'
              ? 'https://eshop.macsales.com/blog/wp-content/uploads/2020/12/Notes-Icon-Big-Sur.png'
              : title === 'Terminal'
              ? 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Terminalicon2.png'
              : title === 'Portfolio'
              ? 'https://cdn.jim-nielsen.com/macos/512/github-desktop-2021-05-20.png'
              : 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Mac_App_Store_logo.png'
          }
        />
      </div>
    </Link>
  )
}

export default IconBox
