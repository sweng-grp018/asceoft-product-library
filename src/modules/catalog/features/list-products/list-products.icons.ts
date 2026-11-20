import type { ComponentType } from "react";
import {
  PackageIcon,
  WheatIcon,
  FishIcon,
  CookingPotIcon,
  MilkIcon,
  CoffeeIcon,
  CookieIcon,
  SprayCanIcon,
  SoupIcon,
} from "lucide-react";
type IconComponent = ComponentType<{ className?: string; strokeWidth?: number }>;
const CATEGORY_ICONS: Record<string, IconComponent> = {
  "Rice & grains": WheatIcon,
  "Canned food": FishIcon,
  "Sauces & seasonings": CookingPotIcon,
  "Noodles & pasta": SoupIcon,
  "Cooking essentials": CookingPotIcon,
  "Milk & dairy": MilkIcon,
  "Coffee & drinks": CoffeeIcon,
  "Snacks & biscuits": CookieIcon,
  "Household care": SprayCanIcon,
};
export function categoryIcon(category: string): IconComponent {
  return CATEGORY_ICONS[category] ?? PackageIcon;
}
