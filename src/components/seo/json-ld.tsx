/**
 * Structured data, rendered inline. Next has no metadata field for JSON-LD, so
 * it goes in as a script tag the way Google's own guidance spells out; the
 * payload is our own serialized object, never user input.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: the only way to emit a JSON-LD script body, and the content is ours.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
