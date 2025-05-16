
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

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
  // Enhanced pre-processor to better handle LaTeX expressions
  const processedMarkdown = markdown
    // Make sure there are no spaces between $ and the math expression
    .replace(/\$ (.*?) \$/g, '$$$1$$')
    .replace(/\$\$ (.*?) \$\$/g, '$$$$1$$')
    // Handle LaTeX expressions that might not be correctly formatted
    .replace(/\(\\theta_([a-z0-9])\)/g, '$\\theta_{$1}$')
    .replace(/\\theta_([a-z0-9])/g, '\\theta_{$1}')
    // Handle common LaTeX patterns in machine learning notation
    .replace(/\(\\theta_\{([^}]+)\}\)/g, '$\\theta_{$1}$')
    .replace(/\(\\eta\)/g, '$\\eta$')
    .replace(/\(L\(\\theta_\{([^}]+)\}; ([^)]+)\)\)/g, '$L(\\theta_{$1}; $2)$')
    .replace(/\(\\nabla L\(\\theta_\{([^}]+)\}; ([^)]+)\)\)/g, '$\\nabla L(\\theta_{$1}; $2)$')
    // Handle parentheses in LaTeX
    .replace(/\(\(([^)]+)\)\)/g, '($1)');

  return (
    <div className="katex-wrapper">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
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
  );
}

export default GPTOutput;
