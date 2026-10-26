
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT DATABASE() AS database_name, 1 AS connected"
    );

    return NextResponse.json({
      success: true,
      message: "MySQL connection successful",
      data: rows,
    });
  } catch (error) {
    console.error("MySQL connection error:", error);

    return NextResponse.json(
      { success: false, message: "MySQL connection failed" },
      { status: 500 }
    );
  }
}
