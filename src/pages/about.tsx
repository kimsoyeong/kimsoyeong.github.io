import React, { FunctionComponent } from 'react'
import { graphql, Link } from 'gatsby'
// import Layout from '../layout';
// import Seo from '../components/seo';
// import Bio from '../components/bio';
import TimeStampSection from '../timestamp-section'
// import TimeStampSection from '../components/timestamp-section'
// import ProjectSection from '../components/project-section';

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
type AboutPageProps = {
  data: {
    site: {
      siteMetadata: {
        title: string
        description: string
        language: string
        author: {
          name: string
          bio: {
            command: string
            thumbnail: string
          }
          social: {
            github: string
            linkedIn: string
            email: string
          }
        }
        about: {
          school: [TimeStamp]
          experience: [TimeStamp]
          projects: [Project]
        }
      }
    }
  }
}

const AboutPage: FunctionComponent<AboutPageProps> = function ({
  data: {
    site: {
      siteMetadata: {
        title,
        description,
        language,
        author: {
          name,
          bio: { command, thumbnail },
          social: { github, linkedIn, email },
        },
        about: { school, experience, projects },
      },
    },
  },
}) {
  return (
    <div>
      <h1>About</h1>
      <h2>{name}</h2>
      <div>
        <h3>BIO</h3>
        <div>{command}</div>
        <div>{thumbnail}</div>
        <Link to={github}>Github</Link> <Link to={linkedIn}>Linked In</Link>{' '}
        <Link to={email}>Email</Link>
      </div>
      <TimeStampSection timestamps={school} title={'School'} />
      <TimeStampSection timestamps={experience} title={'Experience'} />

      <div>
        <h3>Projects</h3>
        {projects.map((project, i) => (
          <li key={i}>
            {project.title} {project.description}
            {project.thumbnailUrl}
          </li>
        ))}
      </div>
    </div>

    // <Layout>
    //   <Seo title="About" />
    //   <Bio author={author} language={language} />
    //   <ProjectSection projects={projects} />
    // </Layout>
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
          bio {
            command
            thumbnail
          }
          social {
            github
            linkedIn
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
        }
      }
    }
  }
`
