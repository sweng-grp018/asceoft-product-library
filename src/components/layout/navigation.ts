import {
  ArrowUpRight,
  Images,
  LayoutDashboard,
  Package,
  ScanSearch,
  Settings,
  Users,
} from "lucide-react";
import { hasMinRole, type Role } from "@/modules/auth/permissions";

export const appPurpose =
  "Lensistry keeps a grocery store’s product details and photos together, so the team can find the right item and pack size without searching through separate lists.";

export type StorePage = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  minRole: Role;
  purpose: string;
  example: string;
};

export const storePages: StorePage[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    minRole: "ADMIN",
    purpose: "See product totals and recently added items.",
    example: "I check how many groceries are saved before adding a new delivery.",
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    minRole: "STAFF",
    purpose: "Find and add products. Store managers can also edit or remove them.",
    example:
      "I add Isla Pantry Banana Ketchup 320 g with its brand and product code so staff can find the right pack.",
  },
  {
    label: "Find from a photo",
    href: "/detection",
    icon: ScanSearch,
    minRole: "STAFF",
    purpose: "Find a product from a pack photo or look for products in a saved shelf photo.",
    example: "I upload a photo of an unfamiliar pack to look for matches in the catalog.",
  },
  {
    label: "Photos",
    href: "/repository",
    icon: Images,
    minRole: "STAFF",
    purpose: "Save shelf photos and see which product photos are ready for search.",
    example: "I save a shelf photo, then check whether the sardines have a prepared product photo.",
  },
  {
    label: "Staff",
    href: "/users",
    icon: Users,
    minRole: "ADMIN",
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
    label: "Profile",
    href: "/profile",
    icon: Settings,
    purpose: "View and save your name and email address.",
    example: "I update my email address so I can use it the next time I sign in.",
  },
];

export function visibleStorePages(role: string) {
  return storePages.filter((page) => hasMinRole(role, page.minRole));
}
