import { db } from "../lib/db.js";
import { config } from "../lib/config.js";
import SYNTHETIC_GROCERY_PRODUCTS from "../../modules/catalog/grocery-products.json" with { type: "json" };

const target = new URL(config.DATABASE_URL);
console.log(`Adding fictional grocery products to ${target.hostname}${target.pathname}`);
try {
  let added = 0;
  for (const product of SYNTHETIC_GROCERY_PRODUCTS) {
    const existing = await db.product.findUnique({
      where: { sku: product.sku },
      select: { id: true },
    });
    if (existing) continue;
    await db.product.create({ data: product });
    added++;
  }
  console.log(`Added ${added} products. Existing products and accounts were left unchanged.`);
} finally {
  await db.$disconnect();
}
