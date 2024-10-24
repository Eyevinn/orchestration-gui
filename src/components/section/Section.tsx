'use client';

import { PropsWithChildren, useState } from 'react';

interface SectionProps {
  title: string;
  alwaysOpen?: boolean;
  startOpen?: boolean;
}

const Section: React.FC<SectionProps & PropsWithChildren> = (props) => {
  const { title, alwaysOpen = false, startOpen = false, children } = props;

  const [open, setOpen] = useState<boolean>(alwaysOpen || startOpen);

  const toggleOpen = () => {
    if (alwaysOpen) return;
    setOpen(!open);
  };

  return (
    <div className="mt-6 bg-zinc-600 rounded-xl">
      <div
        className="flex justify-between text-white uppercase text-xl m-2 hover:cursor-pointer h-8 items-center"
        onClick={toggleOpen}
      >
        <div className="ml-4">{title}</div>
        <div className="text-2xl mr-2">{open ? '-' : '+'}</div>
      </div>
      <div className={`bg-container p-4 ${open ? '' : 'hidden'} rounded-b-xl`}>
        {children}
      </div>
    </div>
  );
};

export default Section;
