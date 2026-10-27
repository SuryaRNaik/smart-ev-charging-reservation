
"use client";

import { useEffect, useState } from "react";

type Vehicle = {
  ev_id: number;
  registration_number: string;
  make?: string;
  model?: string;
};

type ChargingPoint = {
  point_id: number;
  station_name: string;
  connector_type?: string;
  power_kw?: number;
};

type Reservation = {
  reservation_id: number;
  start_time: string;
  end_time: string;
  status: string;
  station_name?: string;
  point_id?: number;
  registration_number?: string;
};

export default function ReservationsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [points, setPoints] = useState<ChargingPoint[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [evId, setEvId] = useState("");
  const [pointId, setPointId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [minDateTime, setMinDateTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadReservations() {
    const response = await fetch("/api/reservations");
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Could not load reservations.");
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

        setMinDateTime(
          new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        );

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

    loadData();
  }, []);

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  async function handleBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!evId || !pointId || !startTime || !endTime) {
      setError("Please fill in all booking fields.");
      return;
    }

    if (new Date(startTime) <= new Date()) {
      setError("The reservation start time must be in the future.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("The end time must be after the start time.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ev_id: Number(evId),
          point_id: Number(pointId),
          start_time: startTime,
          end_time: endTime,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Booking failed.");
      }

      setMessage(result.message || "Reservation created successfully.");
      setStartTime("");
      setEndTime("");

      await loadReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancellation(reservationId: number) {
    const confirmed = window.confirm(
      `Cancel reservation #${reservationId}?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/reservations", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservation_id: reservationId,
          user_id: 1,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Cancellation failed.");
      }

      setMessage(result.message || "Reservation cancelled successfully.");
      await loadReservations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Cancellation failed."
      );
    }
  }

  if (loading) {
    return <main className="p-8">Loading reservations...</main>;
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <section>
        <h1 className="text-3xl font-bold">EV Charging Reservations</h1>
        <p className="mt-2 text-gray-600">
          Book a charging point and manage your reservations.
        </p>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded border border-red-300 bg-red-50 p-3 text-red-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded border border-green-300 bg-green-50 p-3 text-green-700"
        >
          {message}
        </div>
      )}

      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Book a charging point</h2>

        <form onSubmit={handleBooking} className="space-y-4">
          <div>
            <label htmlFor="evId" className="mb-1 block font-medium">
              Electric vehicle
            </label>
            <select
              id="evId"
              value={evId}
              onChange={(event) => setEvId(event.target.value)}
              required
              className="w-full rounded border p-2"
            >
              <option value="">Select your vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.ev_id} value={vehicle.ev_id}>
                  {vehicle.registration_number}
                  {vehicle.make || vehicle.model
                    ? ` — ${[vehicle.make, vehicle.model].filter(Boolean).join(" ")}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pointId" className="mb-1 block font-medium">
              Charging point
            </label>
            <select
              id="pointId"
              value={pointId}
              onChange={(event) => setPointId(event.target.value)}
              required
              className="w-full rounded border p-2"
            >
              <option value="">Select a charging point</option>
              {points.map((point) => (
                <option key={point.point_id} value={point.point_id}>
                  {point.station_name} — Point {point.point_id}
                  {point.connector_type ? ` — ${point.connector_type}` : ""}
                  {point.power_kw ? ` — ${point.power_kw} kW` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="startTime" className="mb-1 block font-medium">
              Start time
            </label>
            <input
              id="startTime"
              type="datetime-local"
              min={minDateTime}
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="mb-1 block font-medium">
              End time
            </label>
            <input
              id="endTime"
              type="datetime-local"
              min={startTime || minDateTime}
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              required
              className="w-full rounded border p-2"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || vehicles.length === 0 || points.length === 0}
            className="rounded bg-blue-600 px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Booking..." : "Book reservation"}
          </button>
        </form>

        {vehicles.length === 0 && (
          <p className="mt-3 text-sm text-amber-700">
            No vehicles are available for booking.
          </p>
        )}

        {points.length === 0 && (
          <p className="mt-3 text-sm text-amber-700">
            No charging points are available.
          </p>
        )}
      </section>

      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">All reservations</h2>

        {reservations.length === 0 ? (
          <p className="text-gray-600">No reservations found.</p>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <article
                key={reservation.reservation_id}
                className="flex flex-col justify-between gap-4 rounded border p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-semibold">
                    Reservation #{reservation.reservation_id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {reservation.station_name || "Charging station"}
                    {reservation.point_id
                      ? ` — Point ${reservation.point_id}`
                      : ""}
                  </p>
                  {reservation.registration_number && (
                    <p className="text-sm text-gray-600">
                      Vehicle: {reservation.registration_number}
                    </p>
                  )}
                  <p className="mt-1 text-sm">
                    Start: {formatDate(reservation.start_time)}
                  </p>
                  <p className="text-sm">
                    End: {formatDate(reservation.end_time)}
                  </p>
                  <p className="mt-1 text-sm">
                    Status: <span className="font-medium">{reservation.status}</span>
                  </p>
                </div>

                {["Booked", "Confirmed"].includes(reservation.status) && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCancellation(reservation.reservation_id)
                    }
                    className="rounded border border-red-500 px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Cancel reservation
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
