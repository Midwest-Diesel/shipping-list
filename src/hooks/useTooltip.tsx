import { tooltipAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import { useEffect } from "react";


export function useTooltip() {
  const [, setTooltip] = useAtom<string>(tooltipAtom);

  const set = (msg: string) => {
    setTooltip(msg);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setTooltip('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setTooltip]);

  return { set };
}
