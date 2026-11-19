type Props = { eyebrow?: string; title: string; text?: string; light?: boolean };
export function SectionHeading({ eyebrow, title, text, light }: Props) {
  return <div className={`section-heading ${light ? "light" : ""}`}>
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h2>{title}</h2>
    {text && <p>{text}</p>}
  </div>;
}
