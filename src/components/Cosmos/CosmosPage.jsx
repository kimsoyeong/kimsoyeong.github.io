import { useEffect, useRef } from "react";
import { mountCosmos } from "./runtime";
import markup from "./markup";
import "./cosmos.css";

export default function CosmosPage({ onDailyNavigate }) {
  const root = useRef(null);
  useEffect(() => {
    root.current.innerHTML = markup;
    return mountCosmos(root.current);
  }, []);
  useEffect(() => {
    if (!onDailyNavigate) return undefined;
    const element = root.current;
    const onClick = (event) => {
      const link = event.target.closest("a[data-daily-link]");
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      onDailyNavigate();
    };
    element.addEventListener("click", onClick);
    return () => element.removeEventListener("click", onClick);
  }, [onDailyNavigate]);
  return <div ref={root} className="cosmos-page" />;
}
