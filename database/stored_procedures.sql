-- Smart Manufacturing System - PostgreSQL Stored Procedures
-- These procedures handle production data recording, machine status updates,
-- shift summaries, and temperature logging with automatic aggregation

-- ============================================================================
-- sp_record_production_data
-- Records production data and automatically aggregates into shift summaries
-- ============================================================================
CREATE OR REPLACE FUNCTION sp_record_production_data(
    p_machine_id INT,
    p_units INT,
    p_timestamp TIMESTAMP
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    v_shift_type VARCHAR(20);
    v_shift_date DATE;
    v_hour INT;
BEGIN
    -- Extract hour and date from timestamp
    v_hour := EXTRACT(HOUR FROM p_timestamp);
    v_shift_date := p_timestamp::DATE;
    
    -- Determine shift type based on hour
    -- Morning: 07:00-15:00 (7-14)
    -- Afternoon: 15:00-23:00 (15-22)
    -- Night: 23:00-07:00 (23-6)
    IF v_hour >= 7 AND v_hour < 15 THEN
        v_shift_type := 'morning';
    ELSIF v_hour >= 15 AND v_hour < 23 THEN
        v_shift_type := 'afternoon';
    ELSE
        v_shift_type := 'night';
        -- For night shift, if hour is 0-6, it belongs to previous day's night shift
        IF v_hour < 7 THEN
            v_shift_date := v_shift_date - INTERVAL '1 day';
        END IF;
    END IF;
    
    -- Insert production data record
    INSERT INTO production_data (machine_id, units_produced, recorded_at, shift_type, created_at, updated_at)
    VALUES (p_machine_id, p_units, p_timestamp, v_shift_type, NOW(), NOW());
    
    -- Update or create production_shifts aggregate
    INSERT INTO production_shifts (machine_id, shift_date, shift_type, total_units, created_at, updated_at)
    VALUES (p_machine_id, v_shift_date, v_shift_type, p_units, NOW(), NOW())
    ON CONFLICT (machine_id, shift_date, shift_type)
    DO UPDATE SET
        total_units = production_shifts.total_units + p_units,
        updated_at = NOW();
    
    RETURN QUERY SELECT TRUE, 'Production data recorded successfully'::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- sp_update_machine_status
-- Updates machine status and tracks downtime
-- ============================================================================
CREATE OR REPLACE FUNCTION sp_update_machine_status(
    p_machine_id INT,
    p_status VARCHAR(20)
)
RETURNS TABLE(previous_status VARCHAR(20), success BOOLEAN) AS $$
DECLARE
    v_previous_status VARCHAR(20);
BEGIN
    -- Get current status
    SELECT status INTO v_previous_status
    FROM machines
    WHERE id = p_machine_id;
    
    -- Update machine status
    UPDATE machines
    SET status = p_status, updated_at = NOW()
    WHERE id = p_machine_id;
    
    
    RETURN QUERY SELECT v_previous_status, TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT v_previous_status, FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- sp_get_shift_summary
-- Retrieves aggregated production data for a specific shift
-- ============================================================================
CREATE OR REPLACE FUNCTION sp_get_shift_summary(
    p_shift_date DATE,
    p_shift_type VARCHAR(20)
)
RETURNS TABLE(
    machine_id INT,
    machine_name VARCHAR(255),
    machine_type VARCHAR(20),
    total_units INT,
    avg_temperature NUMERIC(5,2),
    downtime_minutes INT,
    operator_name VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.machine_id,
        m.name AS machine_name,
        m.type::VARCHAR(20) AS machine_type,
        ps.total_units,
        ps.avg_temperature,
        ps.downtime_minutes,
        o.name AS operator_name
    FROM production_shifts ps
    INNER JOIN machines m ON ps.machine_id = m.id
    LEFT JOIN operators o ON m.current_operator_id = o.id
    WHERE ps.shift_date = p_shift_date
      AND ps.shift_type = p_shift_type
    ORDER BY m.name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- sp_record_temperature
-- Records temperature and triggers alerts if threshold exceeded
-- ============================================================================
CREATE OR REPLACE FUNCTION sp_record_temperature(
    p_machine_id INT,
    p_temperature NUMERIC(5,2),
    p_timestamp TIMESTAMP
)
RETURNS TABLE(success BOOLEAN, alert_triggered BOOLEAN, message TEXT) AS $$
DECLARE
    v_alert_triggered BOOLEAN := FALSE;
    v_temp_threshold NUMERIC(5,2) := 80.00;
BEGIN
    -- Check if temperature exceeds threshold
    IF p_temperature > v_temp_threshold THEN
        v_alert_triggered := TRUE;
        
        -- Update machine status to warning
        UPDATE machines
        SET status = 'warning', updated_at = NOW()
        WHERE id = p_machine_id AND status != 'offline' AND status != 'maintenance';
    END IF;
    
    -- Insert temperature log
    INSERT INTO machine_temperature_logs (
        machine_id, 
        temperature, 
        recorded_at, 
        alert_triggered, 
        created_at, 
        updated_at
    )
    VALUES (
        p_machine_id, 
        p_temperature, 
        p_timestamp, 
        v_alert_triggered, 
        NOW(), 
        NOW()
    );
    
    -- Update average temperature in current shift
    UPDATE production_shifts ps
    SET avg_temperature = (
        SELECT AVG(temperature)
        FROM machine_temperature_logs mtl
        WHERE mtl.machine_id = p_machine_id
          AND mtl.recorded_at::DATE = ps.shift_date
    ),
    updated_at = NOW()
    WHERE ps.machine_id = p_machine_id
      AND ps.shift_date = p_timestamp::DATE;
    
    RETURN QUERY SELECT TRUE, v_alert_triggered, 'Temperature recorded successfully'::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Helper function to get current shift type
-- ============================================================================
CREATE OR REPLACE FUNCTION get_current_shift()
RETURNS VARCHAR(20) AS $$
DECLARE
    v_hour INT;
BEGIN
    v_hour := EXTRACT(HOUR FROM CURRENT_TIMESTAMP);
    
    IF v_hour >= 7 AND v_hour < 15 THEN
        RETURN 'morning';
    ELSIF v_hour >= 15 AND v_hour < 23 THEN
        RETURN 'afternoon';
    ELSE
        RETURN 'night';
    END IF;
END;
$$ LANGUAGE plpgsql;
