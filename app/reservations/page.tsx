
"use client";

import { useEffect, useState } from "react";

type Reservation = {
  reservation_id: number;
  start_time: string;
  end_time: string;
  status: string;
  user_name: string;
  ev_model: string;
  vehicle_number: string;
  point_id: number;
  connector_type: string;
  power_kw: number;
  station_name: string;
  location: string;
  city: string;
};

type Vehicle = {
  ev_id: number;
  user_id: number;
  vehicle_number: string;
  model: string;
  connector_type: string;
};

type ChargingPoint = {
  point_id: number;
  station_id: number;
  connector_type: string;
  power_kw: number;
  status: string;
  station_name: string;
  location: string;
  city: string;
  tariff_id: number;
  rate_per_kwh: number;
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [points, setPoints] = useState<ChargingPoint[]>([]);

  const [evId, setEvId] = useState("");
  const [pointId, setPointId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [minDateTime, setMinDateTime] = useState("");

  async function loadReservations() {
    const response = await fetch("/api/reservations");
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error("Could not load reservations.");
    }

    setReservations(result.data);
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [optionsResponse] = await Promise.all([
          fetch("/api/booking-options"),
          loadReservations(),
        ]);

        const options = await optionsResponse.json();

        if (!optionsResponse.ok || !options.success) {
          throw new Error(
            options.message || "Could not load booking options."
          );
        }

        setVehicles(options.vehicles);
        setPoints(options.chargingPoints);

        if (options.vehicles.length > 0) {
          setEvId(String(options.vehicles[0].ev_id));
        }

        if (options.chargingPoints.length > 0) {
          setPointId(String(options.chargingPoints[0].point_id));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load data."
        );
      } finally {
        setLoading(false);
      }
    }
    
setMinDateTime(
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
);
    loadData();
  }, []);

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const selectedPoint = points.find(
    (point) => String(point.point_id) === pointId
  );

  async function handleBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!evId || !pointId || !startTime || !endTime) {
      setError("Please complete all booking fields.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }

    if (new Date(startTime) <= new Date()) {
      setError("Please choose a future start time.");
      return;
    }

    if (!selectedPoint) {
      setError("Please select an available charging point.");
      return;
    }

    setBooking(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 1,
          ev_id: Number(evId),
          point_id: selectedPoint.point_id,
          tariff_id: selectedPoint.tariff_id,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Booking failed.");
      }

      setMessage(
        `Reservation #${result.reservation_id} created successfully!`
      );
      setStartTime("");
      setEndTime("");

      await loadReservations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create reservation."
      );
    } finally {
      setBooking(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900 sm:p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold">
          EV Charging Reservations
        </h1>

        <p className="mb-8 text-gray-600">
          Book a charging slot and view scheduled reservations.
        </p>

        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            Book a Charging Slot
          </h2>

          <form onSubmit={handleBooking} className="space-y-5">
            <div>
              <label
                htmlFor="vehicle"
                className="mb-1 block text-sm font-medium"
              >
                Select Vehicle
              </label>
              <select
                id="vehicle"
                value={evId}
                onChange={(event) => setEvId(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white p-3"
              >
                <option value="">Choose your vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.ev_id} value={vehicle.ev_id}>
                    {vehicle.model} — {vehicle.vehicle_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="point"
                className="mb-1 block text-sm font-medium"
              >
                Select Charging Point
              </label>
              <select
                id="point"
                value={pointId}
                onChange={(event) => setPointId(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white p-3"
              >
                <option value="">Choose a charging point</option>
                {points.map((point) => (
                  <option key={point.point_id} value={point.point_id}>
                    Point {point.point_id} — {point.station_name} (
                    {point.connector_type}, {point.power_kw} kW)
                  </option>
                ))}
              </select>

              {selectedPoint && (
                <p className="mt-2 text-sm text-gray-600">
                  {selectedPoint.location}, {selectedPoint.city} · ₹
                  {Number(selectedPoint.rate_per_kwh).toFixed(2)}/kWh
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="start"
                  className="mb-1 block text-sm font-medium"
                >
                  Start Date & Time
                </label>
                <input
                  id="start"
                  type="datetime-local"
                  value={startTime}
                  min={minDateTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3"
                />
              </div>

              <div>
                <label
                  htmlFor="end"
                  className="mb-1 block text-sm font-medium"
                >
                  End Date & Time
                </label>
                <input
                  id="end"
                  type="datetime-local"
                  value={endTime}
                  min={startTime || minDateTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-lg bg-green-50 p-3 text-green-700"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={booking || loading || points.length === 0 || vehicles.length === 0}
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {booking ? "Booking..." : "Book Charging Slot"}
            </button>
          </form>
        </section>

        <h2 className="mb-5 text-2xl font-bold">
          Scheduled Reservations
        </h2>

        {loading && <p>Loading reservations...</p>}

        {error && loading && <p className="text-red-600">{error}</p>}

        {!loading && reservations.length === 0 && (
          <p>No reservations found.</p>
        )}

        {!loading && reservations.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {reservations.map((reservation) => (
              <article
                key={reservation.reservation_id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">
                    Reservation #{reservation.reservation_id}
                  </h3>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {reservation.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Customer:</strong> {reservation.user_name}
                  </p>
                  <p>
                    <strong>Vehicle:</strong> {reservation.ev_model} (
                    {reservation.vehicle_number})
                  </p>
                  <p>
                    <strong>Station:</strong> {reservation.station_name}
                  </p>
                  <p>
                    <strong>Location:</strong> {reservation.location},{" "}
                    {reservation.city}
                  </p>
                  <p>
                    <strong>Charging point:</strong> {reservation.point_id}
                  </p>
                  <p>
                    <strong>Connector:</strong> {reservation.connector_type}
                  </p>
                  <p>
                    <strong>Power:</strong> {reservation.power_kw} kW
                  </p>
                  <p>
                    <strong>Start:</strong>{" "}
                    {formatDate(reservation.start_time)}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {formatDate(reservation.end_time)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
