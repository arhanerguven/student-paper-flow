
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GPTOutputProps {
  markdown: string;
}

// Define the code component props type
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export function GPTOutput({ markdown }: GPTOutputProps) {
  // Enhanced pre-processor for better LaTeX formatting
  const processedMarkdown = markdown
    // Make sure there are no spaces between $ and the math expression
    .replace(/\$ (.*?) \$/g, '$$$1$$')
    .replace(/\$\$ (.*?) \$\$/g, '$$$$1$$')
    // Add spaces before and after inline LaTeX expressions
    .replace(/(\w)\$/g, '$1 $')
    .replace(/\$(\w)/g, '$ $1')
    // Handle subscripts better (like \theta_t)
    .replace(/\\([a-zA-Z]+)_([a-zA-Z0-9]+)/g, '\\$1_{$2}')
    // Handle complex math expressions with nabla, etc.
    .replace(/\\nabla/g, '\\nabla ')
    .replace(/\\frac/g, '\\frac');

  return (
    <div className="katex-output-container">
      <div className="katex-wrapper">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          className="line-spaced-content"
          components={{
            p: ({ node, ...props }) => (
              <p className="mb-4" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="mb-2" {...props} />
            ),
            code({ node, inline, className, children, ...props }: CodeProps) {
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
    </div>
  );
}

export default GPTOutput;
