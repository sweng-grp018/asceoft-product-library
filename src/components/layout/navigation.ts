import {
  ArrowUpRight,
  History,
  Images,
  LayoutDashboard,
  Package,
  ScanSearch,
  Settings,
  Users,
} from "lucide-react";

export const appPurpose =
  "Lensistry keeps a grocery store’s product details and photos together, so the team can find the right item and pack size without searching through separate lists.";

export const storePages = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    purpose: "See product totals and recently added items.",
    example: "I check how many groceries are saved before adding a new delivery.",
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    purpose: "Find products. Store managers can add, edit, or remove them.",
    example:
      "I add Isla Pantry Banana Ketchup 320 g with its brand and product code so staff can find the right pack.",
  },
  {
    label: "Find from a photo",
    href: "/detection",
    icon: ScanSearch,
    purpose: "Search a saved shelf photo when photo search is available.",
    example:
      "Once photo search is connected, I choose a shelf photo to look for products. Until then, I search by name.",
  },
  {
    label: "Photos",
    href: "/repository",
    icon: Images,
    purpose: "Save shelf photos and see which product photos are ready for search.",
    example: "I save a shelf photo, then check whether the sardines have a prepared product photo.",
  },
  {
    label: "Past searches",
    href: "/history",
    icon: History,
    purpose: "Review your saved photo searches and correct product choices.",
    example:
      "If a search chose the wrong milk pack, I choose the correct product and save the change.",
  },
  {
    label: "Staff",
    href: "/users",
    icon: Users,
    managerOnly: true,
    purpose: "Let a store manager add staff accounts or reset staff passwords.",
    example:
      "I create an account for a colleague so they can save shelf photos with their own sign-in.",
  },
];

export const accountPages = [
  {
    label: "Browse products",
    href: "/search",
    icon: ArrowUpRight,
    purpose: "Browse and search the grocery list without signing in.",
    example: "I search jasmine rice to check the available pack sizes.",
  },
  {
    label: "My account",
    href: "/profile",
    icon: Settings,
    purpose: "View and save your name and email address.",
    example: "I update my email address so I can use it the next time I sign in.",
  },
];

export function visibleStorePages(role: string) {
  return storePages.filter(
    (page) => !("managerOnly" in page && page.managerOnly) || role === "ADMIN",
  );
}
