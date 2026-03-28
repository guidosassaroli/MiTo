import { mountWidget } from "skybridge/web";
import { useToolInfo } from "../helpers.js";

/**
 * Placeholder widget.
 * Replace this component with the real frontend implementation.
 */
function Placeholder() {
  const { output } = useToolInfo<"placeholder">();

  return (
    <div style={{ width: "100%", aspectRatio: "21 / 9", padding: "1rem", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      <strong>MiTo — Placeholder Widget</strong>
      <p style={{ marginTop: "0.5rem", color: "#555" }}>
        {output?.message ?? "Loading…"}
      </p>
    </div>
  );
}

export default Placeholder;

mountWidget(<Placeholder />);
