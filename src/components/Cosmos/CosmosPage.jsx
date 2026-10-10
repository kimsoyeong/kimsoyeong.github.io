import { useEffect, useRef } from "react";
import { mountCosmos } from "./runtime";
import markup from "./markup";
import "./cosmos.css";

export default function CosmosPage() {
  const root = useRef(null);
  useEffect(() => {
    root.current.innerHTML = markup;
    return mountCosmos(root.current);
  }, []);
  return <div ref={root} className="cosmos-page" />;
}
