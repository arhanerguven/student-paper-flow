
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface GPTOutputProps {
  markdown: string;
}

export function GPTOutput({ markdown }: GPTOutputProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    >
      {markdown}
    </ReactMarkdown>
  );
}

export default GPTOutput;
