import {useEffect, useState, type RefObject} from "react";
import {observeAnimationActivity} from "@/components/animations/animationActivity";
export function useAnimationActivity(ref: RefObject<Element | null>) {
  const [active, setActive] = useState(false);
  useEffect(() => { if (ref.current) return observeAnimationActivity(ref.current, setActive); }, [ref]);
  return active;
}
