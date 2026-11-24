// Observe only eligibility to animate; never change an element's visual layout.
export function observeAnimationActivity(element: Element, onChange: (active: boolean) => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = typeof IntersectionObserver === "undefined";
  let previous: boolean | undefined;
  const update = () => {
    const active = visible && !document.hidden && !media.matches;
    if (active !== previous) { previous = active; onChange(active); }
  };
  const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting; update();
  }, {threshold: 0});
  observer?.observe(element);
  document.addEventListener("visibilitychange", update);
  media.addEventListener("change", update);
  update();
  return () => { observer?.disconnect(); document.removeEventListener("visibilitychange", update); media.removeEventListener("change", update); };
}
