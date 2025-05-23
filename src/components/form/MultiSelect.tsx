import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  text: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  defaultSelected?: string[];
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
  singleSelect?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  defaultSelected = [],
  onChange,
  disabled = false,
  singleSelect = false,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync selectedOptions with defaultSelected only when necessary
  useEffect(() => {
    // Compare arrays to avoid unnecessary updates
    if (
      defaultSelected.length !== selectedOptions.length ||
      defaultSelected.some((val, idx) => val !== selectedOptions[idx])
    ) {
      setSelectedOptions(defaultSelected);
    }
  }, [defaultSelected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!disabled) setIsOpen((prev) => !prev);
  };

  const handleSelect = (optionValue: string) => {
    let newSelectedOptions: string[];

    if (singleSelect) {
      newSelectedOptions = [optionValue];
    } else {
      newSelectedOptions = selectedOptions.includes(optionValue)
        ? selectedOptions.filter((value) => value !== optionValue)
        : [...selectedOptions, optionValue];
    }

    setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
    setSearchTerm("");
    if (singleSelect) setIsOpen(false);
  };

  const removeOption = (value: string) => {
    const newSelectedOptions = selectedOptions.filter((opt) => opt !== value);
    setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
  };

  // Filter options based on search term and exclude selected options (for multi-select only)
  const filteredOptions = options.filter(
    (option) =>
      (!singleSelect || !selectedOptions.includes(option.value)) &&
      option.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedValuesText = selectedOptions.map(
    (value) => options.find((option) => option.value === value)?.text || ""
  );

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {label}
      </label>
      <div className="relative inline-block w-full">
        <div className="relative flex flex-col items-center">
          <div className="w-full">
            <div className="mb-2 flex h-11 rounded-lg border border-gray-300 py-1.5 pl-3 pr-3 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:shadow-focus-ring dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-300">
              <div className="flex flex-wrap flex-auto gap-2">
                <input
                  placeholder="Search or select option"
                  className="w-full h-full p-1 pr-2 text-sm bg-transparent border-0 outline-hidden appearance-none placeholder:text-gray-800 focus:border-0 focus:outline-hidden focus:ring-0 dark:placeholder:text-white/90"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!isOpen) setIsOpen(true);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown();
                  }}
                />
              </div>
              <div className="flex items-center py-1 pl-1 pr-1 w-7">
                <button
                  type="button"
                  onClick={toggleDropdown}
                  className="w-5 h-5 text-gray-700 outline-hidden cursor-pointer focus:outline-hidden dark:text-gray-400"
                >
                  <svg
                    className={`stroke-current ${isOpen ? "rotate-180" : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {selectedValuesText.length > 0 && (
            <div className="flex flex-wrap items-start gap-2 mt-2">
              {selectedValuesText.map((text, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-start rounded-full border-[0.7px] border-transparent bg-gray-100 py-1 pl-2.5 pr-2 text-sm text-gray-800 hover:border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-800"
                >
                  <span className="flex-initial max-w-full">{text}</span>
                  <div className="flex flex-row-reverse flex-auto">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOption(selectedOptions[index]);
                      }}
                      className="pl-2 text-gray-500 cursor-pointer group-hover:text-gray-400 dark:text-gray-400"
                    >
                      <svg
                        className="fill-current"
                        role="button"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {isOpen && (
            <div
              className="absolute left-0 w-full overflow-y-auto bg-white rounded-lg shadow-lg top-[calc(100%+0.5rem)] max-h-40 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <div
                      key={index}
                      className={`hover:bg-primary/5 w-full cursor-pointer ${
                        index === 0 ? "rounded-t-lg" : ""
                      } ${index === filteredOptions.length - 1 ? "rounded-b-lg" : ""} border-b border-gray-200 dark:border-gray-800`}
                      onClick={() => handleSelect(option.value)}
                    >
                      <div
                        className={`relative flex w-full items-start p-2 pl-2 ${
                          selectedOptions.includes(option.value) ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="mx-2 leading-6 text-gray-800 dark:text-white/90">
                          {option.text}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 dark:text-gray-400">
                    No options found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiSelect;