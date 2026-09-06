export function validateCreateRoomStatus(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    if (!body.status_name || typeof body.status_name !== 'string' || !body.status_name.trim()) {
        errors.push("'status_name' is required and must be a non-empty string.");
    }
    else if (body.status_name.trim().length > 50) {
        errors.push("'status_name' cannot exceed 50 characters.");
    }
    if (!body.status_code || typeof body.status_code !== 'string' || !body.status_code.trim()) {
        errors.push("'status_code' is required and must be a non-empty string.");
    }
    else if (body.status_code.trim().length > 7) {
        errors.push("'status_code' cannot exceed 7 characters.");
    }
    if (body.short_name !== undefined && body.short_name !== null) {
        if (typeof body.short_name !== 'string') {
            errors.push("'short_name' must be a string.");
        }
        else if (body.short_name.trim().length > 50) {
            errors.push("'short_name' cannot exceed 50 characters.");
        }
    }
    if (body.status_color !== undefined && body.status_color !== null) {
        if (typeof body.status_color !== 'string') {
            errors.push("'status_color' must be a string.");
        }
        else if (body.status_color.trim().length > 7) {
            errors.push("'status_color' cannot exceed 7 characters (e.g., #FFFFFF).");
        }
    }
    if (body.text_color !== undefined && body.text_color !== null) {
        if (typeof body.text_color !== 'string') {
            errors.push("'text_color' must be a string.");
        }
        else if (body.text_color.trim().length > 7) {
            errors.push("'text_color' cannot exceed 7 characters (e.g., #000000).");
        }
    }
    if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
        errors.push("'is_active' must be a boolean.");
    }
    const optionalFks = ['room_id', 'room_type_id', 'floor_id', 'building_id'];
    for (const fk of optionalFks) {
        if (body[fk] !== undefined && body[fk] !== null) {
            if (typeof body[fk] !== 'number' || !Number.isInteger(body[fk]) || body[fk] <= 0) {
                errors.push(`'${fk}' must be a positive integer if provided.`);
            }
        }
    }
    return errors;
}
export function validateUpdateRoomStatus(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    if (body.status_name !== undefined) {
        if (typeof body.status_name !== 'string' || !body.status_name.trim()) {
            errors.push("'status_name' cannot be empty.");
        }
        else if (body.status_name.trim().length > 50) {
            errors.push("'status_name' cannot exceed 50 characters.");
        }
    }
    if (body.status_code !== undefined) {
        if (typeof body.status_code !== 'string' || !body.status_code.trim()) {
            errors.push("'status_code' cannot be empty.");
        }
        else if (body.status_code.trim().length > 7) {
            errors.push("'status_code' cannot exceed 7 characters.");
        }
    }
    if (body.short_name !== undefined && body.short_name !== null) {
        if (typeof body.short_name !== 'string') {
            errors.push("'short_name' must be a string.");
        }
        else if (body.short_name.trim().length > 50) {
            errors.push("'short_name' cannot exceed 50 characters.");
        }
    }
    if (body.status_color !== undefined && body.status_color !== null) {
        if (typeof body.status_color !== 'string') {
            errors.push("'status_color' must be a string.");
        }
        else if (body.status_color.trim().length > 7) {
            errors.push("'status_color' cannot exceed 7 characters.");
        }
    }
    if (body.text_color !== undefined && body.text_color !== null) {
        if (typeof body.text_color !== 'string') {
            errors.push("'text_color' must be a string.");
        }
        else if (body.text_color.trim().length > 7) {
            errors.push("'text_color' cannot exceed 7 characters.");
        }
    }
    if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
        errors.push("'is_active' must be a boolean.");
    }
    const optionalFks = ['room_id', 'room_type_id', 'floor_id', 'building_id'];
    for (const fk of optionalFks) {
        if (body[fk] !== undefined && body[fk] !== null) {
            if (typeof body[fk] !== 'number' || !Number.isInteger(body[fk]) || body[fk] <= 0) {
                errors.push(`'${fk}' must be a positive integer if provided.`);
            }
        }
    }
    return errors;
}
