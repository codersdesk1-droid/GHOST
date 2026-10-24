import Image from "next/image";
import type { Category } from "@/data/products";
import GarmentArt from "./GarmentArt";

/** Real photo when one exists, otherwise the rendered placeholder. */
export default function ProductVisual({
  src,
  alt,
  category,
  color,
  id,
  sizes = "(max-width: 768px) 80vw, 33vw",
  priority,
  className = "",
}: {
  src?: string;
  alt: string;
  category: Category;
  color: string;
  id: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <div className={`absolute inset-0 grid place-items-center ${className}`}>
      <GarmentArt category={category} color={color} id={id} className="h-[88%] w-[88%]" />
    </div>
  );
}
