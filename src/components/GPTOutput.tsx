
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
  // Enhanced pre-processor for better LaTeX formatting
  const processedMarkdown = markdown
    // Preserve raw LaTeX blocks
    .replace(/\\\[(.*?)\\\]/gs, '$$$$1$$')
    .replace(/\\\((.*?)\\\)/gs, '$$1$')
    // Properly format math environments
    .replace(/\\begin\{(equation|align|gather|bmatrix)\}(.*?)\\end\{\1\}/gs, '$$\\begin{$1}$2\\end{$1}$$')
    // Make sure there are no spaces between $ and the math expression
    .replace(/\$ (.*?) \$/g, '$$$1$$')
    .replace(/\$\$ (.*?) \$\$/g, '$$$$1$$')
    // Add spacing before and after display math
    .replace(/\$\$(.*?)\$\$/gs, '\n\n$$\n$1\n$$\n\n')
    // Improve spacing around inline math
    .replace(/([^\n])\$([^$\n]+)\$/g, '$1 $$$2$$ ')
    // Handle subscripts better (like \theta_t)
    .replace(/\\([a-zA-Z]+)_([a-zA-Z0-9]+)/g, '\\$1_{$2}')
    // Handle complex math expressions with nabla, etc.
    .replace(/\\nabla/g, '\\nabla ')
    .replace(/\\frac/g, '\\frac')
    // Fix mathbf and similar commands
    .replace(/\\mathbf\{([^}]+)\}/g, '\\mathbf{$1}')
    // Fix matrix notation
    .replace(/\\begin\{bmatrix\}/g, '\\begin{bmatrix} ')
    .replace(/\\end\{bmatrix\}/g, ' \\end{bmatrix}');

  return (
    <div className="katex-output-container">
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
            },
            p({ children }) {
              return <p className="mb-4">{children}</p>;
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
