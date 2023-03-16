import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import GlobalStyle from 'components/Common/GlobalStyle'
import Footer from 'components/Common/Footer'
import CategoryList from 'components/Main/CategoryList'
import Introduction from 'components/Main/Introduction'
import { graphql, Link } from 'gatsby'

const CATEGORY_LIST = {
  All: 5,
  Web: 3,
  Mobile: 2,
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`

const IndexPage: FunctionComponent = function () {
  return (
    <Container>
      <GlobalStyle />
      <Introduction />
      {/* <CategoryList selectedCategory="Mobile" categoryList={CATEGORY_LIST} /> */}
      <Link to="/about">To About</Link>
      <Footer />
    </Container>
  )
}

export default IndexPage
