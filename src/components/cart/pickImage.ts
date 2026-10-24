import { slugify } from "@/data/products";

/** Photos whose filename starts with the colour slug belong to that colour. */
export function imagesForColor(images: string[], colorName: string) {
  const prefix = `/${slugify(colorName)}`;
  const matching = images.filter((src) => decodeURIComponent(src.slice(src.lastIndexOf("/"))).toLowerCase().startsWith(prefix));
  return matching.length ? matching : images;
}

export function pickImage(images: string[], colorName: string) {
  return imagesForColor(images, colorName)[0];
}
