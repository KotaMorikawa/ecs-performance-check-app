import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_URL || "http://localhost:8000";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Always fetch fresh data for client-side requests
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const categories = await response.json();

    return NextResponse.json(categories, {
      headers: {
        "Cache-Control": "no-cache, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Categories API route error:", error);

    return NextResponse.json(
      { error: "Failed to fetch categories" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, max-age=0",
        },
      }
    );
  }
}
