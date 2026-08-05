import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  parallax?: number;
};

/** Mask reveal + subtle parallax on the inner image. */
export function RevealImage({ src, alt, className, imgClassName, parallax = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cleanup = () => {};

    loadGsap().then(({ gsap }) => {
      const ctx = gsap.context(() => {
        const img = el.querySelector("img");
        gsap.fromTo(
          el,
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.4,
            ease: "power4.out",
            scrollTrigger: { trigger: el, start: "top 90%" },
          },
        );
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.25 },
            {
              scale: 1,
              duration: 1.6,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 90%" },
            },
          );
          if (parallax) {
            gsap.to(img, {
              yPercent: parallax,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            });
          }
        }
      }, el);
      cleanup = () => ctx.revert();
    });

    return () => cleanup();
  }, [parallax]);

  return (
    <div ref={ref} className={cn("overflow-hidden bg-muted", className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}