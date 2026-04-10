import katex from "katex";
import "katex/dist/katex.min.css";

const Formula = ({ tex, block = false, className = "" }) => {
  const html = katex.renderToString(tex, {
    displayMode: block,
    throwOnError: false,
    strict: false,
  });

  return block ? (
    <div
      className={`formula-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Formula;
