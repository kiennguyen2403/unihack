interface PageHeaderProps {
  children: React.ReactNode;
}

const PageHeader = ({ children }: PageHeaderProps) => {
  return <header>{children}</header>;
};

export default PageHeader;
