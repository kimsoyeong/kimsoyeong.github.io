import React, { FunctionComponent } from 'react'
import { AiFillFile, AiFillGithub, AiFillPlayCircle } from 'react-icons/ai'
import './style.css'
// import SectionHeader from '../section-header'
// import IconButtonBar from '../icon-button-bar'

const ProjectsSection: FunctionComponent<{ projects: any }> = function ({
  projects,
}) {
  if (!projects || projects.length < 2) return null
  return (
    <div className="section-inner">
      <h3 className="section-title">Projects</h3>
      <div className="section-content">
        <ol className="item-text" style={{ listStyle: 'none' }}>
          {projects.map((project: any, index: number) =>
            index === 0 ? null : (
              <li className="project" key={index}>
                <div className="title" style={{ marginBottom: '0' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {project.title}
                  </span>
                  <div className="project-links">
                    {project.links.post ? (
                      <a href={project.links.post} target="_blank">
                        <AiFillFile color="rgba(204, 209, 223)" />
                      </a>
                    ) : null}
                    {project.links.github ? (
                      <a href={project.links.github} target="_blank">
                        <AiFillGithub color="rgba(204, 209, 223)" />
                      </a>
                    ) : null}
                    {project.links.demo ? (
                      <a href={project.links.demo} target="_blank">
                        <AiFillPlayCircle color="rgba(204, 209, 223)" />
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="techstack">
                  {project.techStack.map((tech: string, index: number) => (
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '400',
                        backgroundColor: 'rgba(204, 209, 223, 0.3)',
                        padding: '2px 8px',
                        margin: '4px 8px 8px 0',
                        borderRadius: '0.4em',
                      }}
                    >
                      {tech}
                    </div>
                  ))}
                </div>
                {project.thumbnailUrl ? (
                  <img src={project.thumbnailUrl} />
                ) : null}
                <p
                  className="desc"
                  style={{ fontSize: '13px', fontWeight: '400' }}
                >
                  {project.description}
                </p>
              </li>
            ),
          )}
        </ol>
      </div>
    </div>
  )
}

export default ProjectsSection
