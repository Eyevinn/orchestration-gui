'use client';

export default function HeaderNavigation({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-row justify-between">{children}</div>;
}
