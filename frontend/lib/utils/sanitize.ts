/**
 * XML/HTML escape for LLM prompt injection defense
 * Prevents user input from breaking out of XML tags in prompts
 */
export function escapeXmlForLlm(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
