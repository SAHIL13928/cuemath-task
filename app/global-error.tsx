"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0f",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 16,
          padding: 32,
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
          Something went wrong
        </h2>
        {error?.message && (
          <pre
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "12px 20px",
              fontSize: 13,
              color: "#f87171",
              maxWidth: 600,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              textAlign: "left",
            }}
          >
            {error.message}
            {error.digest ? `\nDigest: ${error.digest}` : ""}
          </pre>
        )}
        <button
          onClick={reset}
          style={{
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
