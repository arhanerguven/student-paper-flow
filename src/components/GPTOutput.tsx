
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
    // Ensure basic dollar signs are properly handled
    .replace(/\$/g, "$$")
    .replace(/\$\$/g, "$")
    
    // Preserve raw LaTeX blocks
    .replace(/\\\[(.*?)\\\]/gs, '$$\n$1\n$$')
    .replace(/\\\((.*?)\\\)/gs, '$\n$1\n$')
    
    // Properly format math environments
    .replace(/\\begin\{(equation|align|gather|bmatrix|matrix|pmatrix|vmatrix|Vmatrix)\*?\}(.*?)\\end\{\1\*?\}/gs, 
            '$$\n\\begin{$1}$2\\end{$1}\n$$')
    
    // Make sure there are no spaces between $ and the math expression
    .replace(/\$ (.*?) \$/g, '$\n$1\n$')
    .replace(/\$\$ (.*?) \$\$/g, '$$\n$1\n$$')
    
    // Add spacing before and after display math
    .replace(/\$\$(.*?)\$\$/gs, '\n\n$$\n$1\n$$\n\n')
    
    // Improve spacing around inline math
    .replace(/([^\n$])\$([^$\n]+)\$/g, '$1 $\n$2\n$ ')
    
    // Handle subscripts better (like \theta_t)
    .replace(/\\([a-zA-Z]+)_([a-zA-Z0-9]+)/g, '\\$1_{$2}')
    
    // Handle complex math expressions
    .replace(/\\nabla/g, '\\nabla ')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '\\frac{$1}{$2}')
    
    // Fix mathbf, mathcal and similar commands
    .replace(/\\mathbf\{([^}]+)\}/g, '\\mathbf{$1}')
    .replace(/\\mathcal\{([^}]+)\}/g, '\\mathcal{$1}')
    
    // Fix matrix notation
    .replace(/\\begin\{bmatrix\}/g, '\\begin{bmatrix} ')
    .replace(/\\end\{bmatrix\}/g, ' \\end{bmatrix}')
    
    // Fix sum and other operators
    .replace(/\\sum_\{([^}]+)\}/g, '\\sum_{$1} ')
    .replace(/\\sum_([a-zA-Z0-9])/g, '\\sum_{$1} ')
    
    // Fix subscripts in math mode
    .replace(/_\{([^}]+)\}/g, '_{$1}')
    
    // Fix superscripts in math mode
    .replace(/\^([a-zA-Z0-9])/g, '^{$1}')
    .replace(/\^\{([^}]+)\}/g, '^{$1}');

  return (
    <div className="katex-output-container">
      <ScrollArea className="katex-scroll-area">
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
      </ScrollArea>
    </div>
  );
}

export default GPTOutput;
