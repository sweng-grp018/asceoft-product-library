export function GET() {
  return Response.json(
    { error: "Authentication is not configured yet." },
    { status: 501 },
  );
}

export function POST() {
  return Response.json(
    { error: "Authentication is not configured yet." },
    { status: 501 },
  );
}
