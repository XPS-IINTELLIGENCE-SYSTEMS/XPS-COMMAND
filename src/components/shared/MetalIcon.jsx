import { cn } from "@/lib/utils";

export const METAL_ICONS = {
  find_work: "https://media.base44.com/images/public/69db3269c791af3f48cfaee9/ead8d31c0_generated_image.png",
  get_work: "https://media.base44.com/images/public/69db3269c791af3f48cfaee9/12b3abdeb_generated_image.png",
  do_work: "https://media.base44.com/images/public/69db3269c791af3f48cfaee9/b146276f6_generated_image.png",
  get_paid: "https://media.base44.com/images/public/69db3269c791af3f48cfaee9/59d70dfb9_generated_image.png",
  start_here: "https://media.base44.com/images/public/69db3269c791af3f48cfaee9/b5b8c555b_generated_image.png",
  command: "https://media.base44.com/images/public/69db3269c791af3f48cfaee9/c1385903b_generated_image.png",
  tips: "https://media.base44.com/images/public/69db3269c791af3f48cfaee9/d37586f3a_generated_image.png",
  settings: "https://media.base44.com/images/public/69db3269c791af3f48cfaee9/fba17586e_generated_image.png",
};

export default function MetalIcon({ id, size = "md", className }) {
  const src = METAL_ICONS[id];
  if (!src) return null;

  const sizeClasses = {
    xs: "w-5 h-5",
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    "2xl": "w-20 h-20",
  };

  return (
    <img
      src={src}
      alt=""
      className={cn(
        sizeClasses[size] || sizeClasses.md,
        "object-contain select-none pointer-events-none",
        className
      )}
      draggable={false}
    />
  );
}