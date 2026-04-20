import ReactDOMServer from 'react-dom/server';
import type { ResumeData } from '../types/resume';
import { templateMap } from '../components/preview/templates';

export function serializeResumeToHtml(data: ResumeData, onePageScale?: number | null): string {
  const TemplateComponent = templateMap[data.templateId] || templateMap['classic'];

  const bodyHtml = ReactDOMServer.renderToStaticMarkup(
    <TemplateComponent data={data} onePageScale={onePageScale} />
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 0; }
    body { margin: 0; padding: 0; }
    ul, ol { list-style-position: inside; }
    li > ul { list-style-type: disc; padding-left: 1.2em; margin: 2px 0; }
    li > ol { list-style-type: decimal; padding-left: 1.2em; margin: 2px 0; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`;
}
