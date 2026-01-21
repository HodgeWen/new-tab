import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-white/20",
  {
    variants: {
      variant: {
        default:
          "bg-white/10 text-white hover:bg-white/20",
        destructive:
          "bg-red-500/80 text-white hover:bg-red-500",
        outline:
          "border border-white/20 bg-transparent shadow-xs hover:bg-white/10 text-white",
        secondary:
          "bg-white/20 text-white hover:bg-white/30",
        ghost:
          "hover:bg-white/10 text-white",
        link: "text-white underline-offset-4 hover:underline",
        glass:
          "bg-white/15 backdrop-blur-xl border border-white/20 shadow-lg text-white hover:bg-white/25 hover:border-white/30 transition-all duration-200",
      },
      size: {
        "default": "h-9 px-4 py-2 has-[>svg]:px-3",
        "sm": "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        "lg": "h-10 rounded-md px-6 has-[>svg]:px-4",
        "icon": "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
