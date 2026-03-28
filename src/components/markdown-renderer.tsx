import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMarkdown(raw: string): string {
  let html = escapeHtml(raw);

  // Code blocks
  html = html.replace(
    /```[\w]*\n?([\s\S]*?)```/g,
    '<pre class="bg-muted rounded-md p-4 overflow-x-auto text-sm my-4"><code>$1</code></pre>',
  );
  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
  );
  // Headers
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>',
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>',
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>',
  );
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Links (safe - only http/https)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>',
  );
  // Unordered list
  html = html.replace(/^\- (.+)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(
    /(<li[\s\S]*?<\/li>)/gm,
    '<ul class="list-disc my-2">$1</ul>',
  );
  // Ordered list
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>');
  // Paragraphs
  html = html.replace(/\n\n(.+?)(?=\n\n|$)/gs, '<p class="mb-4">$1</p>');
  // Newlines
  html = html.replace(/\n/g, "<br />");

  return html;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const html = renderMarkdown(content);
  return (
    <div
      className={cn("prose prose-sm max-w-none text-foreground", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
