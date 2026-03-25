import { cn } from "@/lib/utils";
import PageHeader from "./PageHeader";
import type { ReactNode } from "react";
interface PropsType {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  rightAction?: ReactNode;
  showHeader?: boolean;
  addMarginTop?: boolean;
  renderPageHeader?: ReactNode;
}

const PageLayout = ({
  children,
  className,
  title,
  subtitle,
  rightAction,
  showHeader = true,
  addMarginTop = false,
  renderPageHeader,
}: PropsType) => {
  return (
    <div>
      {showHeader && (
        <PageHeader
          title={title}
          subtitle={subtitle}
          rightAction={rightAction}
          renderPageHeader={renderPageHeader}
        />
      )}
      <div
        className={cn(
          "w-full max-w-[var(--max-width)] mx-auto pt-8",
          addMarginTop && "-mt-20",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
