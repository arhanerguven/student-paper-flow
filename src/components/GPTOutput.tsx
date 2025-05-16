
import React from 'react';

interface GPTOutputProps {
  markdown: string;
}

export function GPTOutput({ markdown }: GPTOutputProps) {
  return (
    <div className="whitespace-pre-wrap">
      {markdown}
    </div>
  );
}

export default GPTOutput;
