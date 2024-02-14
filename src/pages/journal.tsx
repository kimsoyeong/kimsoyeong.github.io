import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import GlobalStyle from 'components/Common/GlobalStyle'
import Journal from 'components/Main/Journal'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`

const JournalPage: FunctionComponent<{}> = function ({}) {
  return (
    <Container>
      <GlobalStyle />
      <Journal />
    </Container>
  )
}
export default JournalPage
