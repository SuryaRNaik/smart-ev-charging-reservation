-- Smart EV Charging Station Reservation System
-- MySQL Trigger: Prevent overlapping reservations during INSERT

DELIMITER //

DROP TRIGGER IF EXISTS reservations_prevent_overlap_insert//

CREATE TRIGGER reservations_prevent_overlap_insert
BEFORE INSERT ON reservations
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT DEFAULT 0;

    IF NEW.status IN ('Booked', 'Confirmed') THEN
        SELECT COUNT(*)
        INTO conflict_count
        FROM reservations
        WHERE point_id = NEW.point_id
          AND status IN ('Booked', 'Confirmed')
          AND start_time < NEW.end_time
          AND end_time > NEW.start_time;

        IF conflict_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Overlapping reservation not allowed';
        END IF;
    END IF;
END//

DELIMITER ;
-- MySQL Trigger: Prevent overlapping reservations during UPDATE

DELIMITER //

DROP TRIGGER IF EXISTS reservations_prevent_overlap_update//

CREATE TRIGGER reservations_prevent_overlap_update
BEFORE UPDATE ON reservations
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT DEFAULT 0;

    IF NEW.status IN ('Booked', 'Confirmed') THEN
        SELECT COUNT(*)
        INTO conflict_count
        FROM reservations
        WHERE point_id = NEW.point_id
          AND reservation_id <> OLD.reservation_id
          AND status IN ('Booked', 'Confirmed')
          AND start_time < NEW.end_time
          AND end_time > NEW.start_time;

        IF conflict_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Overlapping reservation not allowed';
        END IF;
    END IF;
END//

DELIMITER ;