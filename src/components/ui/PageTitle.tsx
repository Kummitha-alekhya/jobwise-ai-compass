
import React from "react";

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}

export default PageTitle;
