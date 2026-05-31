// src/components/layout/footer.tsx
// Minimal footer. Year is computed on the server to avoid hydration mismatch.
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t py-4">
      <div className="text-muted-foreground px-4 text-center text-sm">
        © {year} ESP App
      </div>
    </footer>
  );
}
