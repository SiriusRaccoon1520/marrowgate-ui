// Markdown渲染组件 — 从 ChatClient.jsx 抽离
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export default function MarkdownContent({ content }) {
  return (
    <div className="md-render">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        breaks={true}
        components={{
          pre: ({ children }) => <pre className="cb">{children}</pre>,
          code: ({ className, children, ...props }) => {
            if (className) {
              return <code className={className} {...props}>{children}</code>;
            }
            return <code className="ic" {...props}>{children}</code>;
          },
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}