import Link from "next/link";
import { api, type Product } from "@/lib/api";
import { auth } from "@/modules/auth/server/session";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
  const { total, products } = await api<{ total: number; products: Product[] }>(
    "/products",
    {},
    false,
  );
  const session = await auth();
  const indexed = products.filter((p) => p.indexStatus === "INDEXED").length;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Workspace overview</h1>
        <p className="text-muted-foreground">
          Manage your product library and test visual identification.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total products</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{total}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Indexed on this page</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{indexed}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Access level</CardTitle>
            <CardDescription>Permissions verified by API</CardDescription>
          </CardHeader>
          <CardContent>{session?.user.role}</CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/products">Manage products</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/repository">Analyze shelf photos</Link>
        </Button>
      </div>
    </div>
  );
}
