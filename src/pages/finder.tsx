import React, { FunctionComponent } from 'react'
import { graphql, Link } from 'gatsby'
import Footer from 'components/Common/Footer'
import ProjectsSection from '../projects-section'

import styled from '@emotion/styled'

import './about.css'

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
type FinderPageProps = {
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

const FinderHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 95%;
  background-color: '#FEFEFE';
  padding: 10px;
  color: black;
  font-weight: 700;

  .small-title {
    line-height: 12px;
    margin: 0 16px;
    font-size: 12px;
  }
`

const AboutPage: FunctionComponent<FinderPageProps> = function ({
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
    <div className="content">
      <FinderHeader>
        <div
          style={{
            display: 'flex',
            verticalAlign: 'middle',
            justifyContent: 'flex-start',
          }}
        >
          <Link to="/">
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
          </Link>
          <Link to="/">
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
          </Link>
          <Link to="/">
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
          </Link>
        </div>
        <div className="small-title">Finder</div>
      </FinderHeader>
      <div className="main-head">
        <section style={{ paddingBottom: '48px' }}>
          <div className="inner"></div>
        </section>
      </div>
      <div className="main-body" style={{ borderBottom: '1.6px solid black' }}>
        <div className="content-grid">
          <div className="project-section">
            <ProjectsSection projects={projects} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AboutPage

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
