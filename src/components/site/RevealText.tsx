import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { loadGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
};

/** Clip-path text reveal driven by GSAP ScrollTrigger. */
export function RevealText({ children, as: Tag = "div", className, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cleanup = () => {};

    loadGsap().then(({ gsap }) => {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0% 0% 100% 0%)", y: 40, filter: "blur(6px)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            filter: "blur(0px)",
            duration: 1.2,
            delay,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          },
        );
      }, el);
      cleanup = () => ctx.revert();
    });

    return () => cleanup();
  }, [delay]);

  return (
    <Tag ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </Tag>
  );
}