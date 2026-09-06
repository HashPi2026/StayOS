export function validateCreateRoom(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    if (body.room_type_id === undefined || typeof body.room_type_id !== 'number' || !Number.isInteger(body.room_type_id) || body.room_type_id <= 0) {
        errors.push("'room_type_id' is required and must be a positive integer.");
    }
    if (body.floor_id === undefined || typeof body.floor_id !== 'number' || !Number.isInteger(body.floor_id) || body.floor_id <= 0) {
        errors.push("'floor_id' is required and must be a positive integer.");
    }
    if (body.building_id === undefined || typeof body.building_id !== 'number' || !Number.isInteger(body.building_id) || body.building_id <= 0) {
        errors.push("'building_id' is required and must be a positive integer.");
    }
    if (!body.room_name || typeof body.room_name !== 'string' || !body.room_name.trim()) {
        errors.push("'room_name' is required and must be a non-empty string.");
    }
    else if (body.room_name.trim().length > 50) {
        errors.push("'room_name' cannot exceed 50 characters.");
    }
    if (!body.short_name || typeof body.short_name !== 'string' || !body.short_name.trim()) {
        errors.push("'short_name' is required and must be a non-empty string.");
    }
    else if (body.short_name.trim().length > 50) {
        errors.push("'short_name' cannot exceed 50 characters.");
    }
    const boolFields = [
        'is_hourly_rental',
        'is_smoking',
        'is_handicap',
        'is_pet_allowed',
        'include_in_occupancy_adr',
        'is_crs_inventory',
    ];
    for (const field of boolFields) {
        if (body[field] !== undefined && typeof body[field] !== 'boolean') {
            errors.push(`'${field}' must be a boolean.`);
        }
    }
    return errors;
}
export function validateUpdateRoom(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    if (body.room_type_id !== undefined) {
        if (typeof body.room_type_id !== 'number' || !Number.isInteger(body.room_type_id) || body.room_type_id <= 0) {
            errors.push("'room_type_id' must be a positive integer.");
        }
    }
    if (body.floor_id !== undefined) {
        if (typeof body.floor_id !== 'number' || !Number.isInteger(body.floor_id) || body.floor_id <= 0) {
            errors.push("'floor_id' must be a positive integer.");
        }
    }
    if (body.building_id !== undefined) {
        if (typeof body.building_id !== 'number' || !Number.isInteger(body.building_id) || body.building_id <= 0) {
            errors.push("'building_id' must be a positive integer.");
        }
    }
    if (body.room_name !== undefined) {
        if (typeof body.room_name !== 'string' || !body.room_name.trim()) {
            errors.push("'room_name' cannot be empty.");
        }
        else if (body.room_name.trim().length > 50) {
            errors.push("'room_name' cannot exceed 50 characters.");
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
    const boolFields = [
        'is_hourly_rental',
        'is_smoking',
        'is_handicap',
        'is_pet_allowed',
        'include_in_occupancy_adr',
        'is_crs_inventory',
    ];
    for (const field of boolFields) {
        if (body[field] !== undefined && typeof body[field] !== 'boolean') {
            errors.push(`'${field}' must be a boolean.`);
        }
    }
    return errors;
}
