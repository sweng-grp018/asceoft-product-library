import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

export async function withSearchProducts(
  run: (products: { name: string; brand: string; sku: string }[]) => Promise<void>,
) {
  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: "postgresql://lensistry:lensistry@127.0.0.1:5433/lensistry_qa",
    }),
  });
  const batch = randomUUID();
  const newest = Date.now();
  // One more than the public page size, with distinct timestamps for stable ordering.
  const products = Array.from({ length: 26 }, (_, index) => ({
    id: randomUUID(),
    name: `QA Rice ${batch} Pack ${index + 1}`,
    brand: `QA Grocer ${batch}`,
    sku: `QA-${batch}-${index + 1}`,
    createdAt: new Date(newest - index * 1000),
  }));
  try {
    await db.product.createMany({ data: products });
    try {
      await run(products);
    } finally {
      await db.product.deleteMany({ where: { id: { in: products.map(({ id }) => id) } } });
    }
  } finally {
    await db.$disconnect();
  }
}
