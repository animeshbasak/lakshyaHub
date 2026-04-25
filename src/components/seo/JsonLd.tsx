/**
 * Inline JSON-LD script component for Schema.org structured data.
 *
 * Usage:
 *   <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', ... }} />
 *
 * The `dangerouslySetInnerHTML` is safe here because the input is a plain object
 * that we serialize ourselves; no user content. If you ever embed user-supplied
 * strings inside a JSON-LD object, sanitize them first (escape `<`, `>`, `&`).
 */
export function JsonLd<T extends object>({ data }: { data: T }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
