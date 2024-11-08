import { IconChevronDown, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

type DropDownProps = {
  title: string;
  label: string;
  options?: { option: string; available: boolean }[];
  selected?: string;
  multipleSelected?: string[];
  setSelected: (option: string) => void;
  disabled: boolean;
};
export default function DropDown({
  title,
  label,
  options,
  selected,
  setSelected,
  disabled,
  multipleSelected
}: DropDownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const element = useRef<HTMLDivElement | null>(null);
  const toggleButton = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toggleButton.current &&
        toggleButton.current.contains(event.target as Node)
      ) {
        return;
      }
      if (element.current && !element.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [element]);
  const handleClick = (option: string, available: boolean) => {
    if (
      !available &&
      !multipleSelected?.includes(option) &&
      selected !== option
    )
      return;
    if (multipleSelected) {
      setSelected(option);
      return;
    }
    setSelected(option);
    setIsOpen(false);
  };
  const toggleIsOpen = () => {
    if (!disabled) {
      setIsOpen((prevState) => !prevState);
    }
  };
  const multipleSelectedString = multipleSelected
    ? multipleSelected?.join(', ')
    : undefined;
  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);
  return (
    <div className="flex flex-row items-center">
      <div className="text-white font-medium mr-4 w-48">{label}</div>
      <div ref={toggleButton} className="relative">
        <button
          onClick={() => toggleIsOpen()}
          className={`text-white bg-light focus:ring-1 focus:outline-none w-64 break-all font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between ${
            disabled && 'opacity-40 pointer-events-none focus:ring-0'
          }`}
          type="button"
        >
          {selected
            ? selected
            : multipleSelectedString
            ? multipleSelectedString
            : title}
          <div
            className={`${
              isOpen ? 'transform rotate-180' : 'transform rotate-0'
            }`}
          >
            <IconChevronDown className="w-6 h-6 text-p" />
          </div>
        </button>
        <div
          ref={element}
          className={` ${
            !isOpen && 'hidden'
          } absolute bg-white divide-y divide-gray-100 rounded-lg shadow-md dark:bg-gray-700 w-64`}
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            {options &&
              options.map((option) => {
                return (
                  <li
                    className="w-64"
                    key={option.option + label}
                    onClick={() => handleClick(option.option, option.available)}
                  >
                    <div
                      className={`${
                        !option.available && 'text-gray-400 cursor-default'
                      } px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-2xl dark:hover:bg-gray-600 dark:hover:text-white flex w-64 justify-between break-all`}
                    >
                      {option.option}
                      {(multipleSelected?.includes(option.option) ||
                        option.option === selected) && <IconX size={20} />}
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
}
