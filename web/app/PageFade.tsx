"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./page-fade.module.css";

export default function PageFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [display, setDisplay] = useState(children);
  const [path, setPath] = useState(pathname);

  useEffect(() => {
    if (pathname === path) {
      setDisplay(children);
      return;
    }

    setVisible(false);
    const timer = window.setTimeout(() => {
      setDisplay(children);
      setPath(pathname);
      requestAnimationFrame(() => setVisible(true));
    }, 220);

    return () => window.clearTimeout(timer);
  }, [pathname, children, path]);

  return (
    <div
      className={`${styles.fade} ${visible ? styles.fadeIn : styles.fadeOut}`}
      key={path}
    >
      {display}
    </div>
  );
}
