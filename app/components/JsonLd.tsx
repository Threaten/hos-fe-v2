/**
 * Renders a JSON-LD <script> block for structured data.
 * Only use in server components or layouts.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so CMS text can never close the script tag early
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
