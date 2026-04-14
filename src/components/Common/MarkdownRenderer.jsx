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
          h1: ({ node, children, ...props }) => (
            <h1 className="text-3xl font-bold my-4" {...props}>{children}</h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 className="text-2xl font-semibold my-3" {...props}>{children}</h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="text-2xl font-semibold my-2" {...props}>{children}</h3>
          ),
          pre: ({ node, ...props }) => (
            <pre className="bg-[#2b2b2b] text-gray-100 p-4 rounded-lg my-3 overflow-x-auto block w-full" {...props} />
          ),
          code: ({ node, className, ...props }) => {
            const isBlock = className || (props.children && typeof props.children === 'string' && props.children.includes('\n'));
            return isBlock ? (
              <code className={`${className || ''} block w-full`} {...props} />
            ) : (
              <code className="bg-gray-200 dark:bg-gray-700 dark:text-gray-200 px-1.5 py-0.5 rounded-md text-sm" {...props} />
            );
          },
          table: ({ node, ...props }) => (
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 my-4" {...props} />
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-100 dark:bg-gray-700" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-400 dark:border-gray-500 pl-4 py-2 my-3 text-gray-600 dark:text-gray-400 italic" {...props} />
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
