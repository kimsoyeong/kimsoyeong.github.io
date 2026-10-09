import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { mountCosmos } from "./runtime";
import markup from "./markup";
import "./cosmos.css";

export default function CosmosPage() {
  const root = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    root.current.innerHTML = markup;
    return mountCosmos(root.current, navigate);
  }, [navigate]);
  return <div ref={root} className="cosmos-page" />;
}
