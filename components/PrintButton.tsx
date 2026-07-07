// components/PrintButton.tsx
"use client";

type PrintButtonProps = {
  className?: string;
};

export function PrintButton({ className = "" }: PrintButtonProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`px-3 py-1 text-xs rounded bg-primary text-light hover:bg-secondary print:hidden ${className}`}
    >
      Cetak / Download PDF
    </button>
  );
}
