import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM charging_stations"
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Charging stations API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch charging stations",
      },
      { status: 500 }
    );
  }
}