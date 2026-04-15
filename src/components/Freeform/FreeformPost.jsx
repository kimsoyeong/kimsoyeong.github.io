import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MarkdownRenderer from "../Common/MarkdownRenderer";
import TableOfContents from "./TableOfContents";
import posts from "./posts";

const FreeformPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");

  const post = posts.find((p) => p.slug === slug);
  const Component = post?.component;
  const hasToc = post?.toc?.length > 0;

  useEffect(() => {
    if (!post || Component) return;
    if (post.path) {
      fetch(post.path)
        .then((res) => res.text())
        .then(setContent)
        .catch(() => setContent("Failed to load content."));
    }
  }, [post, Component]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#fafafa] font-dm-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Post not found.</p>
          <button
            onClick={() => navigate("/freeform")}
            className="font-mono text-[12px] text-gray-800 hover:underline"
          >
            ← Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-dm-sans text-[#1a1e2a]">
      {/* Hero */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-[960px] mx-auto px-7 pt-20 pb-14">
          <button
            onClick={() => navigate("/freeform")}
            className="font-mono text-[12px] text-gray-400 hover:text-gray-800 transition-colors mb-6 block"
          >
            ← All Posts
          </button>

          <div className="flex items-center gap-3 mb-4">
            <img src="/assets/img/Freeform.png" alt="freeform" className="w-6 h-6" />
            <p className="font-mono text-[11px] text-gray-500 tracking-[0.15em] uppercase">
              {post.tag}
            </p>
          </div>
          <h1 className="font-playfair text-3xl md:text-[clamp(2rem,5vw,3.4rem)] leading-[1.15] mb-5">
            {post.title}
            <br />
            <span className="text-gray-600">{post.subtitle}</span>
          </h1>
          <p className="text-gray-500 text-[15px] max-w-[640px] leading-relaxed">
            {post.desc}
          </p>

          <div className="flex gap-7 flex-wrap mt-7 items-center">
            <span className="font-mono text-[12px] text-gray-500">
              날짜 <strong className="text-gray-800">{post.date}</strong>
            </span>
            {post.source && (
              <a
                href={post.source}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[12px] text-gray-500 hover:text-gray-800 underline"
              >
                원본 논문 →
              </a>
            )}
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] text-gray-500 bg-black/5 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content + TOC */}
      <div className={`mx-auto px-7 py-16 ${hasToc ? "max-w-[1280px]" : "max-w-[960px]"}`}>
        <div className={hasToc ? "flex gap-10" : ""}>
          {/* Main content */}
          <div className={hasToc ? "flex-1 min-w-0 max-w-[860px] mx-auto" : ""}>
            {Component ? (
              <Component />
            ) : (
              <div className="bg-[#f0ede4] rounded-lg p-8 md:p-10 shadow-md">
                <MarkdownRenderer content={content} />
              </div>
            )}
          </div>

          {/* TOC sidebar */}
          {hasToc && (
            <aside className="hidden xl:block w-[200px] shrink-0">
              <TableOfContents items={post.toc} />
            </aside>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="max-w-[960px] mx-auto px-7 pb-16">
        <button
          onClick={() => navigate("/freeform")}
          className="font-mono text-[12px] text-gray-400 hover:text-gray-800 transition-colors"
        >
          ← Back to All Posts
        </button>
      </div>
    </div>
  );
};

export default FreeformPost;
