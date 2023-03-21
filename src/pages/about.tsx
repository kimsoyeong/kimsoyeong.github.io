import React, { FunctionComponent } from 'react'
import { graphql, Link } from 'gatsby'
import Footer from 'components/Common/Footer'
import TimeStampSection from '../timestamp-section'
import AwardsSection from '../awards-section'
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
type AboutPageProps = {
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

const AboutHeader = styled.div`
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

const AboutPage: FunctionComponent<AboutPageProps> = function ({
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
      <AboutHeader>
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
        <div className="small-title">Soyeong Kim</div>
      </AboutHeader>
      <div className="main-head">
        <section style={{ paddingBottom: '48px' }}>
          <div className="inner">
            <div
              className="photo"
              style={{
                height: '5rem',
                width: '5rem',
                overflow: 'hidden',
                borderRadius: '90%',
                zIndex: 1,
                marginBottom: '16px',
              }}
            >
              <img
                src="https://storage.surfit.io/career/avatar/wkXQb/1297752256640e906f3c85f.png"
                width="140px"
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            </div>
            <div className="name">
              <span
                style={{
                  padding: 0,
                  margin: 0,
                  outline: 'none',
                  verticalAlign: 'baseline',
                  fontWeight: 'bolder',
                  fontSize: '36px',
                }}
              >
                {name}
              </span>
            </div>
            <div
              className="role"
              style={{
                paddingBottom: '24px',
                marginBottom: '24px',
                borderBottom: '1px solid rgba(204, 209, 223, 0.8)',
              }}
            >
              <span>{role}</span>
            </div>
            <div className="contact">
              <Link
                to={email}
                style={{
                  textDecoration: 'none',
                  color: 'black',
                  fontWeight: '400',
                  fontSize: '12px',
                }}
              >
                <span className="hover-blue">{email}</span>
              </Link>
            </div>
          </div>
        </section>
        <section style={{ paddingBottom: '60px' }}>
          <div className="inner">
            <div className="command" style={{ fontSize: '20px' }}>
              {command}
            </div>
            <div
              className="intro"
              style={{ marginTop: '12px', fontSize: '14px' }}
            >
              {intro}
            </div>
          </div>
        </section>
      </div>
      <div className="main-body">
        <div className="content-grid">
          <div className="school-section">
            <TimeStampSection timestamps={school} title={'School'} />
          </div>
          <div className="experience-section">
            <TimeStampSection timestamps={experience} title={'Experience'} />
          </div>
          <div className="project-section">
            <ProjectsSection projects={projects} />
          </div>

          <div className="award-section">
            <AwardsSection awards={awards} />
          </div>
          <div className="url-section">
            <div className="section-inner">
              <h3 className="section-title">URL</h3>
              <div className="section-content">
                <ol className="item-link">
                  <li>
                    <a
                      href={github}
                      target="_blank"
                      rel="noopener"
                      className="ico-link"
                    >
                      <div className="icon"></div>
                      <span>{github}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={linkedIn}
                      target="_blank"
                      rel="noopener"
                      className="ico-link"
                    >
                      <div className="icon"></div>
                      <span>{linkedIn}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={tistory}
                      target="_blank"
                      rel="noopener"
                      className="ico-link"
                    >
                      <div className="icon"></div>
                      <span>{tistory}</span>
                    </a>
                  </li>
                </ol>
              </div>
            </div>
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
