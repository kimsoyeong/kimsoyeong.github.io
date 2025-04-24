import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import ReactMarkdown from "react-markdown";
import "highlight.js/styles/a11y-dark.css";

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="h-full w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold my-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-semibold my-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-semibold my-2" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="p-2 rounded" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code className="bg-gray-200 p-1 rounded-md" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="my-4" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
