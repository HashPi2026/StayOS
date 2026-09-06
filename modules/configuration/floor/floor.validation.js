export function validateCreateFloor(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    if (body.building_id === undefined || typeof body.building_id !== 'number' || !Number.isInteger(body.building_id) || body.building_id <= 0) {
        errors.push("'building_id' is required and must be a positive integer.");
    }
    if (!body.floor_name || typeof body.floor_name !== 'string' || !body.floor_name.trim()) {
        errors.push("'floor_name' is required and must be a non-empty string.");
    }
    else if (body.floor_name.trim().length > 50) {
        errors.push("'floor_name' cannot exceed 50 characters.");
    }
    if (body.description !== undefined && body.description !== null) {
        if (typeof body.description !== 'string') {
            errors.push("'description' must be a string.");
        }
    }
    return errors;
}
export function validateUpdateFloor(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    if (body.building_id !== undefined) {
        if (typeof body.building_id !== 'number' || !Number.isInteger(body.building_id) || body.building_id <= 0) {
            errors.push("'building_id' must be a positive integer.");
        }
    }
    if (body.floor_name !== undefined) {
        if (typeof body.floor_name !== 'string' || !body.floor_name.trim()) {
            errors.push("'floor_name' cannot be empty.");
        }
        else if (body.floor_name.trim().length > 50) {
            errors.push("'floor_name' cannot exceed 50 characters.");
        }
    }
    if (body.description !== undefined && body.description !== null) {
        if (typeof body.description !== 'string') {
            errors.push("'description' must be a string.");
        }
    }
    return errors;
}
