"use client";

import { useEffect, useRef } from "react";
import type { Category } from "@/data/products";

// Garment measurements in cm, laid flat.
const CHARTS: Record<Category, { cols: string[]; rows: [string, ...number[]][] }> = {
  tees: {
    cols: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
    rows: [
      ["S", 58, 70, 56, 22],
      ["M", 61, 72, 58, 23],
      ["L", 64, 74, 60, 24],
      ["XL", 67, 76, 62, 25],
      ["XXL", 70, 78, 64, 26],
    ],
  },
  hoodies: {
    cols: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
    rows: [
      ["S", 62, 68, 60, 58],
      ["M", 65, 70, 62, 59],
      ["L", 68, 72, 64, 60],
      ["XL", 71, 74, 66, 61],
      ["XXL", 74, 76, 68, 62],
    ],
  },
  jackets: {
    cols: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
    rows: [
      ["S", 63, 68, 58, 60],
      ["M", 66, 70, 60, 61],
      ["L", 69, 72, 62, 62],
      ["XL", 72, 74, 64, 63],
    ],
  },
  pants: {
    cols: ["Size", "Waist", "Inseam", "Thigh", "Leg opening"],
    rows: [
      ["28 / S", 72, 76, 35, 26],
      ["30 / M", 77, 77, 36, 27],
      ["32 / L", 82, 78, 37, 28],
      ["34 / XL", 87, 79, 38, 29],
      ["36", 92, 80, 39, 30],
    ],
  },
};

export default function SizeChart({ open, onClose, category }: { open: boolean; onClose: () => void; category: Category }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  const chart = CHARTS[category];
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="glass m-auto w-[min(92vw,640px)] rounded-[28px] !bg-ink/90 p-0 text-bone backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl">Size chart</h2>
          <button onClick={onClose} className="eyebrow !text-bone" autoFocus>
            Close
          </button>
        </div>
        <p className="mt-2 text-sm text-mist">Garment measured flat, in centimetres. Oversized by design — size down for a regular fit.</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="text-left text-mist">
                {chart.cols.map((c) => (
                  <th key={c} className="pb-3 font-normal">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.rows.map(([s, ...v]) => (
                <tr key={s} className="border-t border-line">
                  <td className="py-3">{s}</td>
                  {v.map((n, i) => (
                    <td key={i} className="py-3 text-bone/80">{n}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </dialog>
  );
}
