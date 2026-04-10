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
      <div className="min-h-screen bg-[#f5f6f8] font-dm-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6b7280] mb-4">Post not found.</p>
          <button
            onClick={() => navigate("/freeform")}
            className="font-dm-mono text-[12px] text-[#2563eb] hover:underline"
          >
            ← Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-dm-sans text-[#1a1e2a]">
      {/* Hero */}
      <div className="border-b border-[#dde1ea]">
        <div className="max-w-[960px] mx-auto px-7 pt-20 pb-14">
          <button
            onClick={() => navigate("/freeform")}
            className="font-dm-mono text-[12px] text-[#6b7280] hover:text-[#2563eb] transition-colors mb-6 block"
          >
            ← All Posts
          </button>

          <p className="font-dm-mono text-[11px] text-[#2563eb] tracking-[0.15em] uppercase mb-4">
            {post.tag}
          </p>
          <h1 className="font-playfair text-3xl md:text-[clamp(2rem,5vw,3.4rem)] leading-[1.15] mb-5">
            {post.title}
            <br />
            <span className="text-[#2563eb]">{post.subtitle}</span>
          </h1>
          <p className="text-[#6b7280] text-[15px] max-w-[640px] leading-relaxed">
            {post.desc}
          </p>

          <div className="flex gap-7 flex-wrap mt-7 items-center">
            <span className="font-dm-mono text-[12px] text-[#6b7280]">
              날짜 <strong className="text-[#b45309]">{post.date}</strong>
            </span>
            {post.source && (
              <a
                href={post.source}
                target="_blank"
                rel="noopener noreferrer"
                className="font-dm-mono text-[12px] text-[#2563eb] hover:underline"
              >
                원본 논문 →
              </a>
            )}
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-dm-mono text-[10px] text-[#6b7280] bg-[#f0f2f7] border border-[#dde1ea] px-2 py-0.5 rounded"
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
          <div className={hasToc ? "flex-1 min-w-0 max-w-[960px]" : ""}>
            {Component ? (
              <Component />
            ) : (
              <div className="bg-white border border-[#dde1ea] rounded-[10px] p-8 md:p-10">
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
          className="font-dm-mono text-[12px] text-[#6b7280] hover:text-[#2563eb] transition-colors"
        >
          ← Back to All Posts
        </button>
      </div>
    </div>
  );
};

export default FreeformPost;
