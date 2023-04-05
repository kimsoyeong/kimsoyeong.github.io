import React, { FunctionComponent, useState } from 'react'
import styled from '@emotion/styled'
import {
  CgChevronRight,
  CgCornerDownRight,
  CgDollar,
  CgGitBranch,
  CgOculus,
  CgPentagonRight,
  CgPlayButton,
} from 'react-icons/cg'

const Term = styled.div`
  position: fixed;
  display: flex;
  box-shadow: 0 22px 70px 4px rgba(0, 0, 0, 0.56);
  z-index: 1;
  overflow: hiddeen;

  height: 60vh;
  width: 60%;
  top: 45%;
  left: 50%;
  max-width: 1000px;
  max-height: 650px;
  transform: translate(-50%, -50%);

  color: black;
  font-weight: bold;
  border-radius: 15px;

  @media screen and (max-width: 576px) {
    flex-direction: row;
    width: 80%;
    border-radius: 12px;
  }
`
const TermHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4rem;
  z-index: 2;
  padding-left: 1rem;
  padding-top: 1rem;

  div {
    display: flex;

    .color-button {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 7px;
      cursor: pointer;
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

const TermContent = styled.div`
  float: none;
  overflow-y: auto;
  width: 100%;
  height: 100%;
  background-color: #1c2431;
  padding: 1rem;
  padding-top: 3rem;

  border-radius: 15px;
`

const CmdLine: FunctionComponent = function ({ command }) {
  return (
    <div className="cmd_line" style={{ marginBottom: '10px' }}>
      <span
        style={{
          backgroundColor: '#DB666F',
          borderTopLeftRadius: '1rem',
          borderBottomLeftRadius: '1rem',
          paddingRight: '20px',
          paddingLeft: '10px',
          paddingTop: '2px',
          paddingBottom: '2px',
          textAlign: 'start',
          fontSize: '14px',
        }}
      >
        guest@term
      </span>
      <span
        style={{
          backgroundColor: '#FFF193',
          borderTopLeftRadius: '1rem',
          borderBottomLeftRadius: '1rem',
          paddingRight: '20px',
          paddingLeft: '10px',
          paddingTop: '2px',
          paddingBottom: '2px',
          marginLeft: '-10px',
          textAlign: 'center',
          fontSize: '14px',
        }}
      >
        <CgGitBranch style={{ verticalAlign: 'middle' }} />
        main
      </span>
      <span
        style={{
          backgroundColor: '#319CF7',
          borderTopLeftRadius: '1rem',
          borderBottomLeftRadius: '1rem',
          borderRadius: '1rem',
          paddingRight: '14px',
          paddingLeft: '10px',
          paddingTop: '2px',
          paddingBottom: '2px',
          marginLeft: '-10px',
          marginRight: '0.6rem',
          fontSize: '14px',
        }}
      >
        <CgDollar style={{ verticalAlign: 'text-top' }} />!
      </span>
      <div style={{ marginTop: '3px' }}>
        <CgPlayButton
          style={{
            verticalAlign: 'middle',
            color: '#49B16F',
            marginRight: '6px',
          }}
        />
        <span style={{ color: '#C0C0C0', fontSize: '12px' }}>{command}</span>
      </div>
    </div>
  )
}

const Terminal: FunctionComponent = function ({ func }) {
  const [termInput, setTermInput] = useState('')
  const [cmds, setCmds] = useState([])

  const onChange = e => {
    setTermInput(e.target.value)
  }

  const enterCmd = () => {
    let tmp = cmds
    if (termInput === 'exit') {
      func()
    }
    tmp.push(termInput)
    setCmds(tmp)
  }

  const handleOnKeyPress = e => {
    if (e.key === 'Enter') {
      enterCmd()
      setTermInput('')
    }
  }

  return (
    <Term>
      <TermHeader className="window_header">
        <div>
          <div className="color-button red" onClick={func}></div>
          <div className="color-button yellow" onClick={func}></div>
          <div className="color-button green"></div>
        </div>
      </TermHeader>
      <TermContent className="term_content">
        {cmds.map((cmd, index) => (
          <CmdLine command={cmd} />
        ))}
        <div className="current_cmd">
          <span
            style={{
              backgroundColor: '#DB666F',
              borderTopLeftRadius: '1rem',
              borderBottomLeftRadius: '1rem',
              paddingRight: '20px',
              paddingLeft: '10px',
              paddingTop: '2px',
              paddingBottom: '2px',
              textAlign: 'start',
              fontSize: '14px',
            }}
          >
            guest@term
          </span>
          <span
            style={{
              backgroundColor: '#FFF193',
              borderTopLeftRadius: '1rem',
              borderBottomLeftRadius: '1rem',
              paddingRight: '20px',
              paddingLeft: '10px',
              paddingTop: '2px',
              paddingBottom: '2px',
              marginLeft: '-10px',
              textAlign: 'center',
              fontSize: '14px',
            }}
          >
            <CgGitBranch style={{ verticalAlign: 'middle' }} />
            main
          </span>
          <span
            style={{
              backgroundColor: '#319CF7',
              borderTopLeftRadius: '1rem',
              borderBottomLeftRadius: '1rem',
              borderRadius: '1rem',
              paddingRight: '14px',
              paddingLeft: '10px',
              paddingTop: '2px',
              paddingBottom: '2px',
              marginLeft: '-10px',
              marginRight: '0.6rem',
              fontSize: '14px',
            }}
          >
            <CgDollar style={{ verticalAlign: 'text-top' }} />!
          </span>
          <input
            type="text"
            name="term_input"
            value={termInput}
            onChange={onChange}
            onKeyDown={handleOnKeyPress}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#EFEFEF',
            }}
            autoFocus
          />
        </div>
      </TermContent>
    </Term>
  )
}

export default Terminal

/* terminal color theme */
// #DB666F // red
// #FFF193 // yellow
// #319CF7 // blue
// #49B16F // green
// #B263E2 // purple
// #02C5C8 // mint
// #EFEFEF // white
// #1c2431 // background
