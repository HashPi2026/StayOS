export function validateCreateBuilding(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    if (!body.building_name || typeof body.building_name !== 'string' || !body.building_name.trim()) {
        errors.push("'building_name' is required and must be a non-empty string.");
    }
    else if (body.building_name.trim().length > 50) {
        errors.push("'building_name' cannot exceed 50 characters.");
    }
    if (body.description !== undefined && body.description !== null) {
        if (typeof body.description !== 'string') {
            errors.push("'description' must be a string.");
        }
    }
    return errors;
}
export function validateUpdateBuilding(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    if (body.building_name !== undefined) {
        if (typeof body.building_name !== 'string' || !body.building_name.trim()) {
            errors.push("'building_name' cannot be empty.");
        }
        else if (body.building_name.trim().length > 50) {
            errors.push("'building_name' cannot exceed 50 characters.");
        }
    }
    if (body.description !== undefined && body.description !== null) {
        if (typeof body.description !== 'string') {
            errors.push("'description' must be a string.");
        }
    }
    return errors;
}
