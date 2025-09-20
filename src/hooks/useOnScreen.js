import { useEffect, useState } from "react";

export default function useOnScreen(targetRef, options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(true);

  useEffect(() => {
    const node = targetRef.current;
    if (!node) return;

    const io = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    io.observe(node);
    return () => io.disconnect();
  }, [targetRef, options.root, options.rootMargin, options.threshold]);

  return isIntersecting;
}
