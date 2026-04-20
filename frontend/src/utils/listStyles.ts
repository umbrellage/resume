/**
 * Add inline list styles to HTML content so lists display correctly
 * in resume preview templates (which use Tailwind CSS that resets list styles).
 */
export function addInlineListStyles(html: string): string {
  return html
    .replace(/<ul>/g, '<ul style="list-style-type: disc; padding-left: 1.2em; margin: 2px 0;">')
    .replace(/<ol>/g, '<ol style="list-style-type: decimal; padding-left: 1.2em; margin: 2px 0;">')
    .replace(/<li>/g, '<li style="margin: 1px 0;">');
}
