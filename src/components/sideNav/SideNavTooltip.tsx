interface SideNavTooltipProps {
  label: string;
  open: boolean;
}

const SideNavTooltip = (props: SideNavTooltipProps) => {
  const { label, open } = props;

  if (open) return <></>;
  return (
    <span className="absolute flex flex-col justify-center items-center bg-light left-20 top-[50%] translate-y-[-50%] h-16 p-4 whitespace-nowrap z-50 rounded-xl text-white invisible group-hover:visible">
      {label}
    </span>
  );
};

export default SideNavTooltip;
