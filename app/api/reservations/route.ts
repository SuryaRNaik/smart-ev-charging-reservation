
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        r.reservation_id,
        r.start_time,
        r.end_time,
        r.status,
        u.name AS user_name,
        e.model AS ev_model,
        e.vehicle_number,
        cp.point_id,
        cp.connector_type,
        cp.power_kw,
        cs.station_name,
        cs.location,
        cs.city
      FROM reservations r
      JOIN users u ON r.user_id = u.user_id
      JOIN evs e ON r.ev_id = e.ev_id
      JOIN charging_points cp ON r.point_id = cp.point_id
      JOIN charging_stations cs ON cp.station_id = cs.station_id
      ORDER BY r.start_time ASC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Reservations API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reservations",
      },
      { status: 500 }
    );
  }
}
