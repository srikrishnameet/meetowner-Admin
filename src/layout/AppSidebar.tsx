import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router"; // Fixed import typo

import {
 
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,

  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { FaFileInvoice, FaSearchLocation } from "react-icons/fa";
import { useSelector } from "react-redux";
import { AuthState } from "../store/slices/authSlice";
// import { RootState } from "../types/auth";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path?: string;
    pro?: boolean;
    new?: boolean;
    nestedItems?: {
      name: string;
      path?: string;
      
      nestedItems?: {
        name: string;
        path: string;
        data?: { property_in: string; property_for: string; status: number };
      }[];
    }[];
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <CalenderIcon />,
    name: "Listings",
    subItems: [
      {
        name: "Residential",
        nestedItems: [
          {
            name: "Buy",
            nestedItems: [
              { name: "Review", path:  "/residential/buy/0", 
                data: { 
                "property_in": "Residential", 
                "property_for": "Sell", 
                "status": 0 
              }  }, 
              { name: "Approved", path:  "/residential/buy/1",
                data: { 
                "property_in": "Residential", 
                "property_for": "Sell", 
                "status": 1
              }  },
              { name: "Rejected", path: "/residential/buy/2",data: { 
                "property_in": "Residential", 
                "property_for": "Sell", 
                "status": 2
              } },
              { name: "Deleted", path: "/residential/buy/3",data: { 
                "property_in": "Residential", 
                "property_for": "Sell", 
                "status": 3
              }  },
              { name: "Expired", path: "/listings/residential/buy/expired" },
              
            ],
          },
          {
            name: "Rent",
            nestedItems: [
              { name: "Review", path: "/residential/rent/0",
                data: { 
                "property_in": "Residential", 
                "property_for": "Rent", 
                "status": 0 
              } }, 
              { name: "Approved", path: "/residential/rent/1",
                data: { 
                "property_in": "Residential", 
                "property_for": "Rent", 
                "status": 1
              }   },
              { name: "Rejected", path: "/residential/rent/2",
                data: { 
                  "property_in": "Residential", 
                  "property_for": "Rent", 
                  "status": 2
              } },
              { name: "Deleted", path: "/residential/rent/3", data: { 
                "property_in": "Residential", 
                "property_for": "Rent", 
                "status": 3
             }  },
              { name: "Expired", path: "/listings/residential/rent/expired" },
             
            ],
          },
        ],
      },
      {
        name: "Commercial",
        nestedItems: [
          {
            name: "Buy",
            nestedItems: [
              { name: "Review", path: "/commercial/buy/0",  data: { 
                "property_in": "Commercial", 
                "property_for": "Sell", 
                "status": 0 
              } },
              { name: "Approved", path: "/commercial/buy/1",  data: { 
                "property_in": "Commercial", 
                "property_for": "Sell", 
                "status":  1
              }  },
              { name: "Rejected", path: "commercial/buy/2",data:{
                "property_in": "Commercial", 
                "property_for": "Sell", 
                "status":  2
              }},
              { name: "Deleted", path: "/commercial/buy/3",data:{
                "property_in": "Commercial", 
                "property_for": "Sell", 
                "status":  3
              } },
              { name: "Expired", path: "/listings/commercial/buy/expired" },
              
            ],
          },
          {
            name: "Rent",
            nestedItems: [
              { name: "Review", path: "/commercial/Rent/0", data: { 
                "property_in": "Commercial", 
                "property_for": "Sell", 
                "status": 0 
              }  },
              { name: "Approved", path: "/commercial/Rent/1", data: { 
                "property_in": "Commercial", 
                "property_for": "Sell", 
                "status": 1 
              } },
              { name: "Rejected", path: "/commercial/Rent/2",data:{
                "property_in": "Commercial", 
                "property_for": "Sell", 
                "status": 2 
              } },
              { name: "Deleted", path: "/commercial/Rent/3",data:{
                "property_in": "Commercial", 
                "property_for": "Sell", 
                "status": 3 
              } },
              { name: "Expired", path: "/listings/commercial/rent/expired" },
              
            ],
          },
        ],
      },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Lead Management",
    subItems: [
      { name: "Buy", path: "/leads/buy/1" },
      { name: "Rent", path: "leads/rent/2" },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
  },
  {
    name: "Pages",
    icon: <ListIcon />,
    subItems: [
      { name: "Form Elements", path: "/form-elements", pro: false },
      { name: "About Us", path: "/about-us", pro: false },
      { name: "Services", path: "/services", pro: false },
      { name: "Careers", path: "/careers", pro: false },
      { name: "Terms", path: "/terms", pro: false },
      { name: "Privacy", path: "/privacy", pro: false },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Accounts",
    subItems: [
      {
        name: "Users",
        nestedItems: [
          { name: "Payment Success", path: "/users/payment-success" },
          { name: "Payment Failure", path: "/payment-failure" },
          { name: "Expiry Soon", path: "/expiry-soon" },
        ],
      },
      {
        name: "Agents",
        nestedItems: [
          { name: "Payment Success", path: "/agents/payment-success" },
          { name: "Payment Failure", path: "/agents/payment-failure" },
          { name: "Expiry Soon", path: "/agents/expiry-soon" },
        ],
      },
      {
        name: "Owner",
        nestedItems: [
          { name: "Payment Success", path: "/users/payment-success" },
          { name: "Payment Failure", path: "/payment-failure" },
          { name: "Expiry Soon", path: "/expiry-soon" },
        ],
      },
      {
        name: "Channel Partner",
        nestedItems: [
          { name: "Payment Success", path: "/agents/payment-success" },
          { name: "Payment Failure", path: "/agents/payment-failure" },
          { name: "Expiry Soon", path: "/agents/expiry-soon" },
        ],
      },
      {
        name: "Builder",
        nestedItems: [
          { name: "Payment Success", path: "/agents/payment-success" },
          { name: "Payment Failure", path: "/agents/payment-failure" },
          { name: "Expiry Soon", path: "/agents/expiry-soon" },
        ],
      },
    ],
  },
  {
    name: "Employees",
    icon: <FaFileInvoice />,
    subItems: [
      { name: "Create Employee", path: "/create-employee", pro: false },
      { name: "All Employees", path: "/all-employees", pro: false },
      {name :"Invoice Generator", path:'/invoice', pro:false}
    ],
  },

  {
    name: "Maps",
    icon: <FaSearchLocation />,
    subItems: [
      { name: "States", path: "/maps/states", pro: false },
      { name: "Cities", path: "/maps/cities", pro: false },
      {name :"Locality", path:'/maps/locality', pro:false}
    ],
  },
];

const othersItems: NavItem[] = [
  // {
  //   icon: <PieChartIcon />,
  //   name: "Charts",
  //   subItems: [
  //     { name: "Line Chart", path: "/line-chart", pro: false },
  //     { name: "Bar Chart", path: "/bar-chart", pro: false },
  //   ],
  // },
  // {
  //   icon: <BoxCubeIcon />,
  //   name: "UI Elements",
  //   subItems: [
  //     { name: "Alerts", path: "/alerts", pro: false },
  //     { name: "Avatar", path: "/avatars", pro: false },
  //     { name: "Badge", path: "/badge", pro: false },
  //     { name: "Buttons", path: "/buttons", pro: false },
  //     { name: "Images", path: "/images", pro: false },
  //     { name: "Videos", path: "/videos", pro: false },
  //   ],
  // },
  // {
  //   icon: <PlugInIcon />,
  //   name: "Authentication",
  //   subItems: [
  //     { name: "Sign In", path: "/signin", pro: false },
  //     { name: "Sign Up", path: "/signup", pro: false },
  //   ],
  // },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const userType = useSelector((state: AuthState) => state.user?.user_type);
  

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [openNestedSubmenu, setOpenNestedSubmenu] = useState<{
    type: "main" | "others";
    index: number;
    subIndex: number;
  } | null>(null);
  const [openDeepNestedSubmenu, setOpenDeepNestedSubmenu] = useState<{
    type: "main" | "others";
    index: number;
    subIndex: number;
    nestedIndex: number;
  } | null>(null);
  
  const filteredNavItems = navItems.filter(item => {
    if (userType === 2) {
      return !["Accounts", "Employees"].includes(item.name);
    }
    return true;
  });

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const nestedSubMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const deepNestedSubMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const [nestedSubMenuHeight, setNestedSubMenuHeight] = useState<
    Record<string, number>
  >({});
  const [deepNestedSubMenuHeight, setDeepNestedSubMenuHeight] = useState<
    Record<string, number>
  >({});

  const isActive = useCallback(
    (path?: string) => !!path && location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem, subIndex) => {
            if (subItem.path && isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType as "main" | "others", index });
              submenuMatched = true;
            }
            if (subItem.nestedItems) {
              subItem.nestedItems.forEach((nestedItem, nestedIndex) => {
                if (nestedItem.path && isActive(nestedItem.path)) {
                  setOpenSubmenu({ type: menuType as "main" | "others", index });
                  setOpenNestedSubmenu({
                    type: menuType as "main" | "others",
                    index,
                    subIndex,
                  });
                  submenuMatched = true;
                }
                if (nestedItem.nestedItems) {
                  nestedItem.nestedItems.forEach((deepNestedItem) => {
                    if (isActive(deepNestedItem.path)) {
                      setOpenSubmenu({ type: menuType as "main" | "others", index });
                      setOpenNestedSubmenu({
                        type: menuType as "main" | "others",
                        index,
                        subIndex,
                      });
                      setOpenDeepNestedSubmenu({
                        type: menuType as "main" | "others",
                        index,
                        subIndex,
                        nestedIndex,
                      });
                      submenuMatched = true;
                    }
                  });
                }
              });
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
      setOpenNestedSubmenu(null);
      setOpenDeepNestedSubmenu(null);
    }
  }, [location.pathname, isActive]);

  useLayoutEffect(() => {
    if (openSubmenu) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
    if (openNestedSubmenu) {
      const key = `${openNestedSubmenu.type}-${openNestedSubmenu.index}-${openNestedSubmenu.subIndex}`;
      if (nestedSubMenuRefs.current[key]) {
        setNestedSubMenuHeight((prev) => ({
          ...prev,
          [key]: nestedSubMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
    if (openDeepNestedSubmenu) {
      const key = `${openDeepNestedSubmenu.type}-${openDeepNestedSubmenu.index}-${openDeepNestedSubmenu.subIndex}-${openDeepNestedSubmenu.nestedIndex}`;
      if (deepNestedSubMenuRefs.current[key]) {
        setDeepNestedSubMenuHeight((prev) => ({
          ...prev,
          [key]: deepNestedSubMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu, openNestedSubmenu, openDeepNestedSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev?.type === menuType && prev.index === index
        ? null
        : { type: menuType, index }
    );
  };

  const handleNestedSubmenuToggle = (
    index: number,
    subIndex: number,
    menuType: "main" | "others"
  ) => {
    setOpenNestedSubmenu((prev) =>
      prev?.type === menuType &&
      prev.index === index &&
      prev.subIndex === subIndex
        ? null
        : { type: menuType, index, subIndex }
    );
  };

  const handleDeepNestedSubmenuToggle = (
    index: number,
    subIndex: number,
    nestedIndex: number,
    menuType: "main" | "others"
  ) => {
    setOpenDeepNestedSubmenu((prev) =>
      prev?.type === menuType &&
      prev.index === index &&
      prev.subIndex === subIndex &&
      prev.nestedIndex === nestedIndex
        ? null
        : { type: menuType, index, subIndex, nestedIndex }
    );
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {/* Top Level (Listings) */}
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`flex items-center w-full p-1 rounded-lg  gap-1 ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-gray-100 text-blue-600"
                  : "hover:bg-gray-50 text-gray-700"
              } ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span className="w-6 h-4 flex-shrink-4">{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="flex-1 text-left">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-blue-600"
                      : "text-gray-500"
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`flex items-center w-full p-2 rounded-lg ${
                  isActive(nav.path)
                    ? "bg-gray-100 text-blue-600"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="w-6 h-6 mr-2">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="flex-1 text-left">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {/* Level 1 (Residential/Commercial) */}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el: HTMLDivElement | null) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`] || 0}px`
                    : "0px",
              }}
            >
              <ul className="mt-1 space-y-1 ml-6">
                {nav.subItems.map((subItem, subIndex) => (
                  <li key={subItem.name}>
                    {subItem.nestedItems ? (
                      <div>
                        <button
                          onClick={() =>
                            handleNestedSubmenuToggle(index, subIndex, menuType)
                          }
                          className={`w-full flex items-center justify-between p-2 rounded-lg ${
                            openNestedSubmenu?.type === menuType &&
                            openNestedSubmenu?.index === index &&
                            openNestedSubmenu?.subIndex === subIndex
                              ? "bg-gray-50 text-blue-600"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span>{subItem.name}</span>
                          <ChevronDownIcon
                            className={`w-5 h-5 transition-transform duration-200 ${
                              openNestedSubmenu?.type === menuType &&
                              openNestedSubmenu?.index === index &&
                              openNestedSubmenu?.subIndex === subIndex
                                ? "rotate-180 text-blue-600"
                                : "text-gray-500"
                            }`}
                          />
                        </button>

                        {/* Level 2 (Buy/Rent) */}
                        <div
                          ref={(el: HTMLDivElement | null) => {
                            nestedSubMenuRefs.current[
                              `${menuType}-${index}-${subIndex}`
                            ] = el;
                          }}
                          className="overflow-hidden transition-all duration-300"
                          style={{
                            height:
                              openNestedSubmenu?.type === menuType &&
                              openNestedSubmenu?.index === index &&
                              openNestedSubmenu?.subIndex === subIndex
                                ? `${
                                    nestedSubMenuHeight[
                                      `${menuType}-${index}-${subIndex}`
                                    ] || 0
                                  }px`
                                : "0px",
                          }}
                        >
                          <ul className="mt-1 space-y-1 ml-4">
                            {subItem.nestedItems.map(
                              (nestedItem, nestedIndex) => (
                                <li key={nestedItem.name}>
                                  {nestedItem.nestedItems ? (
                                    <div>
                                      <button
                                        onClick={() =>
                                          handleDeepNestedSubmenuToggle(
                                            index,
                                            subIndex,
                                            nestedIndex,
                                            menuType
                                          )
                                        }
                                        className={`w-full flex items-center justify-between p-2 rounded-lg ${
                                          openDeepNestedSubmenu?.type ===
                                            menuType &&
                                          openDeepNestedSubmenu?.index ===
                                            index &&
                                          openDeepNestedSubmenu?.subIndex ===
                                            subIndex &&
                                          openDeepNestedSubmenu?.nestedIndex ===
                                            nestedIndex
                                            ? "bg-gray-50 text-blue-600"
                                            : "hover:bg-gray-50 text-gray-700"
                                        }`}
                                      >
                                        <span>{nestedItem.name}</span>
                                        <ChevronDownIcon
                                          className={`w-5 h-5 transition-transform duration-200 ${
                                            openDeepNestedSubmenu?.type ===
                                              menuType &&
                                            openDeepNestedSubmenu?.index ===
                                              index &&
                                            openDeepNestedSubmenu?.subIndex ===
                                              subIndex &&
                                            openDeepNestedSubmenu?.nestedIndex ===
                                              nestedIndex
                                              ? "rotate-180 text-blue-600"
                                              : "text-gray-500"
                                          }`}
                                        />
                                      </button>

                                      {/* Level 3 (Review/Approved/etc) */}
                                      <div
                                        ref={(el: HTMLDivElement | null) => {
                                          deepNestedSubMenuRefs.current[
                                            `${menuType}-${index}-${subIndex}-${nestedIndex}`
                                          ] = el;
                                        }}
                                        className="overflow-hidden transition-all duration-300"
                                        style={{
                                          height:
                                            openDeepNestedSubmenu?.type ===
                                              menuType &&
                                            openDeepNestedSubmenu?.index ===
                                              index &&
                                            openDeepNestedSubmenu?.subIndex ===
                                              subIndex &&
                                            openDeepNestedSubmenu?.nestedIndex ===
                                              nestedIndex
                                              ? `${
                                                  deepNestedSubMenuHeight[
                                                    `${menuType}-${index}-${subIndex}-${nestedIndex}`
                                                  ] || 0
                                                }px`
                                              : "0px",
                                        }}
                                      >
                                        <ul className="mt-1 space-y-1 ml-4">
                                          {nestedItem.nestedItems.map(
                                            (deepNestedItem) => (
                                              <li key={deepNestedItem.name}>
                                                <Link
                                                  to={deepNestedItem.path}
                                                  className={`block p-2 rounded-lg ${
                                                    isActive(
                                                      deepNestedItem.path
                                                    )
                                                      ? "bg-gray-100 text-blue-600"
                                                      : "hover:bg-gray-50 text-gray-700"
                                                  }`}
                                                >
                                                  {deepNestedItem.name}
                                                </Link>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    </div>
                                  ) : (
                                    nestedItem.path && (
                                      <Link
                                        to={nestedItem.path}
                                        className={`block p-2 rounded-lg ${
                                          isActive(nestedItem.path)
                                            ? "bg-gray-100 text-blue-600"
                                            : "hover:bg-gray-50 text-gray-700"
                                        }`}
                                      >
                                        {nestedItem.name}
                                      </Link>
                                    )
                                  )}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      subItem.path && (
                        <Link
                          to={subItem.path}
                          className={`block p-2 rounded-lg ${
                            isActive(subItem.path)
                              ? "bg-gray-100 text-blue-600"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {subItem.name}
                          {subItem.new && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
                              pro
                            </span>
                          )}
                        </Link>
                      )
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[80px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
            {/* <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div> */}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;