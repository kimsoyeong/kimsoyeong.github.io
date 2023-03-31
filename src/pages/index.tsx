import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import GlobalStyle from 'components/Common/GlobalStyle'
import Introduction from 'components/Main/Introduction'
import { graphql } from 'gatsby'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`

const IndexPage: FunctionComponent<IndexPageProps> = function ({
  data: {
    site: {
      siteMetadata: {
        title,
        description,
        language,
        author: {
          name,
          role,
          bio: { command, intro, thumbnail },
          social: { github, linkedIn, tistory, email },
        },
        about: { school, experience, projects, awards },
      },
    },
  },
}) {
  return (
    <Container>
      <GlobalStyle />
      <Introduction projects={projects} />
    </Container>
  )
}

export default IndexPage

type TimeStamp = {
  date: string
  activity: string
  links: {
    github: string
    post: string
    googlePlay: string
    appStore: string
    demo: string
  }
}
type Project = {
  title: string
  description: string
  techStack: [string]
  thumbnailUrl: string
  links: {
    github: string
    post: string
    googlePlay: string
    appStore: string
    demo: string
  }
}
type Award = {
  date: string
  title: string
  host: string
  description: string
  links: {
    github: string
    post: string
    googlePlay: string
    appStore: string
    demo: string
  }
}
type IndexPageProps = {
  data: {
    site: {
      siteMetadata: {
        title: string
        description: string
        language: string
        author: {
          name: string
          role: string
          bio: {
            command: string
            intro: string
            thumbnail: string
          }
          social: {
            github: string
            linkedIn: string
            tistory: string
            email: string
          }
        }
        about: {
          school: [TimeStamp]
          experience: [TimeStamp]
          projects: [Project]
          awards: [Award]
        }
      }
    }
  }
}

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
        language
        author {
          name
          role
          bio {
            command
            intro
            thumbnail
          }
          social {
            github
            linkedIn
            tistory
            email
          }
        }
        about {
          school {
            date
            activity
            links {
              post
              github
              demo
              googlePlay
              appStore
            }
          }
          experience {
            date
            activity
            links {
              post
              github
              demo
              googlePlay
              appStore
            }
          }
          projects {
            title
            description
            techStack
            thumbnailUrl
            links {
              post
              github
              demo
              googlePlay
              appStore
            }
          }
          awards {
            date
            title
            host
            description
            links {
              post
              github
              demo
              googlePlay
              appStore
            }
          }
        }
      }
    }
  }
`
