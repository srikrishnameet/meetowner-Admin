import { Link, useLocation } from "react-router"; // Updated import
import { useState, useEffect, useRef, RefObject } from "react";

interface BreadcrumbProps {
  pageTitle: string;
  pagePlacHolder?: string;
  onFilter?: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  persistSearch?: boolean;
}

const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({
  pageTitle,
  pagePlacHolder,
  onFilter,
  inputRef,
  persistSearch = true,
}) => {
  const location = useLocation(); // Added to detect route changes
  const [inputValue, setInputValue] = useState<string>(() => {
    return persistSearch ? localStorage.getItem("searchQuery") || "" : "";
  });
  const localInputRef = useRef<HTMLInputElement>(null);
  const debouncedInputValue = useDebounce(inputValue, 500);

  const effectiveInputRef = inputRef || localInputRef;

  // Reset inputValue on route change if persistSearch is false
  useEffect(() => {
    if (!persistSearch) {
      setInputValue(""); // Clear search when route changes
    }
  }, [location.pathname, persistSearch]);

  useEffect(() => {
    if (persistSearch) {
      localStorage.setItem("searchQuery", inputValue);
    }
  }, [inputValue, persistSearch]);

  useEffect(() => {
    if (onFilter) {
      onFilter(debouncedInputValue);
    }
  }, [debouncedInputValue, onFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleClear = () => {
    setInputValue("");
    if (persistSearch) {
      localStorage.removeItem("searchQuery");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="relative w-full xl:w-[430px]">
        <input
          type="text"
          placeholder={pagePlacHolder}
          value={inputValue}
          onChange={handleInputChange}
          ref={effectiveInputRef}
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.33333 12.5C10.6345 12.5 12.5 10.6345 12.5 8.33333C12.5 6.03214 10.6345 4.16667 8.33333 4.16667C6.03214 4.16667 4.16667 6.03214 4.16667 8.33333C4.16667 10.6345 6.03214 12.5 8.33333 12.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.8333 15.8333L12.0833 12.0833"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 5L15 15M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      <nav>
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              to="/"
            >
              Home
              <svg
                className="stroke-current"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                  stroke=""
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </li>
          <li className="text-sm text-gray-800 dark:text-white/90">{pageTitle}</li>
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;