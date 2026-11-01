-- Smart EV Charging Station Reservation System
-- MySQL 8.0+
-- View: Complete reservation details

CREATE OR REPLACE VIEW advanced_reservation_details AS
SELECT
    r.reservation_id,
    r.user_id,
    u.name,
    r.ev_id,
    e.vehicle_number,
    r.point_id,
    p.station_id,
    s.station_name,
    r.tariff_id,
    r.start_time,
    r.end_time,
    r.status
FROM reservations AS r
JOIN users AS u
    ON u.user_id = r.user_id
JOIN evs AS e
    ON e.ev_id = r.ev_id
JOIN charging_points AS p
    ON p.point_id = r.point_id
JOIN charging_stations AS s
    ON s.station_id = p.station_id;