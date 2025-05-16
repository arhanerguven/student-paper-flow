
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface GPTOutputProps {
  markdown: string;
}

export function GPTOutput({ markdown }: GPTOutputProps) {
  // Process the markdown to ensure LaTeX is properly formatted
  // This is a simple pre-processor to ensure dollar signs are properly handled
  const processedMarkdown = markdown
    // Make sure there are no spaces between $ and the math expression
    .replace(/\$ (.*?) \$/g, '$$$1$$')
    .replace(/\$\$ (.*?) \$\$/g, '$$$$1$$');

  return (
    <div className="katex-wrapper">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /math-display/.exec(className || '');
            if (match) {
              return (
                <div className="math-display">
                  {children}
                </div>
              );
            }
            if (inline && className === 'math') {
              return <span className="math-inline">{children}</span>;
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {processedMarkdown}
      </ReactMarkdown>
    </div>
  );
}

export default GPTOutput;
