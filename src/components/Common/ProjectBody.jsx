import { useState, useEffect } from "react";

import MarkdownRenderer from "../Common/MarkdownRenderer";

const ProjectBody = ({ project }) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(project.path)
      .then((response) => response.text())
      .then((text) => {
        setContent(text);
      });
  }, [project.path]);

  return (
    <div className="flex w-full h-full justify-center items-center bg-white px-8 pt-3">
      <MarkdownRenderer content={content} />
    </div>
  );
};

export default ProjectBody;
