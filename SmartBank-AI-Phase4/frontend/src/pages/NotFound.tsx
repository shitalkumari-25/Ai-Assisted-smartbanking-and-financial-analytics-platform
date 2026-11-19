import { Link } from "react-router-dom";
export default function NotFound(){return <section className="not-found"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>This page isn't in our map.</h1><p>The link may be incorrect or the page may have moved.</p><Link className="btn btn-primary" to="/">Return home</Link></section>}
