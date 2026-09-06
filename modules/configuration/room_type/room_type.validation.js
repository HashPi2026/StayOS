export function validateCreateRoomType(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    // Required FKs
    if (body.floor_id === undefined || body.floor_id === null) {
        errors.push("'floor_id' is required.");
    }
    else if (!Number.isInteger(Number(body.floor_id)) || Number(body.floor_id) <= 0) {
        errors.push("'floor_id' must be a positive integer.");
    }
    if (body.building_id === undefined || body.building_id === null) {
        errors.push("'building_id' is required.");
    }
    else if (!Number.isInteger(Number(body.building_id)) || Number(body.building_id) <= 0) {
        errors.push("'building_id' must be a positive integer.");
    }
    // Required VARCHAR(50) strings
    if (!body.short_name || typeof body.short_name !== 'string' || !body.short_name.trim()) {
        errors.push("'short_name' is required and cannot be empty.");
    }
    else if (body.short_name.trim().length > 50) {
        errors.push("'short_name' cannot exceed 50 characters.");
    }
    if (!body.room_type_name || typeof body.room_type_name !== 'string' || !body.room_type_name.trim()) {
        errors.push("'room_type_name' is required and cannot be empty.");
    }
    else if (body.room_type_name.trim().length > 50) {
        errors.push("'room_type_name' cannot exceed 50 characters.");
    }
    // Optional string fields
    if (body.room_type_color !== undefined && body.room_type_color !== null) {
        if (typeof body.room_type_color !== 'string' || body.room_type_color.length > 20) {
            errors.push("'room_type_color' must be a string up to 20 characters.");
        }
    }
    if (body.description !== undefined && body.description !== null) {
        if (typeof body.description !== 'string') {
            errors.push("'description' must be a string.");
        }
    }
    // CHECK constraint: over_booking >= 0
    if (body.over_booking !== undefined && body.over_booking !== null) {
        const ob = Number(body.over_booking);
        if (!Number.isInteger(ob) || ob < 0) {
            errors.push("'over_booking' must be an integer greater than or equal to 0.");
        }
    }
    // Booleans
    if (body.allow_in_occupancy !== undefined && typeof body.allow_in_occupancy !== 'boolean') {
        errors.push("'allow_in_occupancy' must be a boolean.");
    }
    if (body.is_crs !== undefined && typeof body.is_crs !== 'boolean') {
        errors.push("'is_crs' must be a boolean.");
    }
    return errors;
}
export function validateUpdateRoomType(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    if (body.floor_id !== undefined) {
        if (!Number.isInteger(Number(body.floor_id)) || Number(body.floor_id) <= 0) {
            errors.push("'floor_id' must be a positive integer.");
        }
    }
    if (body.building_id !== undefined) {
        if (!Number.isInteger(Number(body.building_id)) || Number(body.building_id) <= 0) {
            errors.push("'building_id' must be a positive integer.");
        }
    }
    if (body.short_name !== undefined) {
        if (typeof body.short_name !== 'string' || !body.short_name.trim()) {
            errors.push("'short_name' cannot be empty.");
        }
        else if (body.short_name.trim().length > 50) {
            errors.push("'short_name' cannot exceed 50 characters.");
        }
    }
    if (body.room_type_name !== undefined) {
        if (typeof body.room_type_name !== 'string' || !body.room_type_name.trim()) {
            errors.push("'room_type_name' cannot be empty.");
        }
        else if (body.room_type_name.trim().length > 50) {
            errors.push("'room_type_name' cannot exceed 50 characters.");
        }
    }
    if (body.room_type_color !== undefined && body.room_type_color !== null) {
        if (typeof body.room_type_color !== 'string' || body.room_type_color.length > 20) {
            errors.push("'room_type_color' must be a string up to 20 characters.");
        }
    }
    if (body.description !== undefined && body.description !== null) {
        if (typeof body.description !== 'string') {
            errors.push("'description' must be a string.");
        }
    }
    if (body.over_booking !== undefined && body.over_booking !== null) {
        const ob = Number(body.over_booking);
        if (!Number.isInteger(ob) || ob < 0) {
            errors.push("'over_booking' must be an integer greater than or equal to 0.");
        }
    }
    if (body.allow_in_occupancy !== undefined && typeof body.allow_in_occupancy !== 'boolean') {
        errors.push("'allow_in_occupancy' must be a boolean.");
    }
    if (body.is_crs !== undefined && typeof body.is_crs !== 'boolean') {
        errors.push("'is_crs' must be a boolean.");
    }
    return errors;
}
