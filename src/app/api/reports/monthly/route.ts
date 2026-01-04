import { NextRequest, NextResponse } from "next/server";
import { getMonthlySpending } from "@/domains/reports";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const month = parseInt(searchParams.get("month") || "1", 10);
  const year = parseInt(searchParams.get("year") || "2024", 10);

  if (isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });
  }

  if (isNaN(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  try {
    const data = await getMonthlySpending(month, year);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

