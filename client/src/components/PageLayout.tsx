import PageHeader from "./PageHeader";

interface PropsType {
  className?: string;
  title?: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  showHeader?: boolean;
  addMarginTop?: boolean;
  renderPageHeader?: React.ReactNode;
}

const PageLayout = ({
  title,
  subtitle,
  rightAction,
  showHeader = true,
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
    </div>
  );
};

export default PageLayout;
