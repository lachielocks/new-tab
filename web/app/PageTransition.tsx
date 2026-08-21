import { ViewTransition } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-fade" exit="page-fade">
      {children}
    </ViewTransition>
  );
}
