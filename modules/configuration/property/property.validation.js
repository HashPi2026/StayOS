export function validateUpsertProperty(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    // Required VARCHAR(50) fields
    if (!body.property_name || typeof body.property_name !== 'string' || !body.property_name.trim()) {
        errors.push("'property_name' is required and must be a non-empty string.");
    }
    else if (body.property_name.trim().length > 50) {
        errors.push("'property_name' cannot exceed 50 characters.");
    }
    if (!body.city || typeof body.city !== 'string' || !body.city.trim()) {
        errors.push("'city' is required and must be a non-empty string.");
    }
    else if (body.city.trim().length > 50) {
        errors.push("'city' cannot exceed 50 characters.");
    }
    if (!body.state || typeof body.state !== 'string' || !body.state.trim()) {
        errors.push("'state' is required and must be a non-empty string.");
    }
    else if (body.state.trim().length > 50) {
        errors.push("'state' cannot exceed 50 characters.");
    }
    // Optional VARCHAR(50) fields
    if (body.region !== undefined && body.region !== null) {
        if (typeof body.region !== 'string' || body.region.length > 50) {
            errors.push("'region' must be a string up to 50 characters.");
        }
    }
    if (body.address !== undefined && body.address !== null) {
        if (typeof body.address !== 'string' || body.address.length > 50) {
            errors.push("'address' must be a string up to 50 characters.");
        }
    }
    if (body.url !== undefined && body.url !== null) {
        if (typeof body.url !== 'string' || body.url.length > 50) {
            errors.push("'url' must be a string up to 50 characters.");
        }
    }
    // Numeric coordinates NUMERIC(9,6)
    if (body.latitude !== undefined && body.latitude !== null && body.latitude !== '') {
        const lat = Number(body.latitude);
        if (isNaN(lat) || lat < -90 || lat > 90) {
            errors.push("'latitude' must be a valid number between -90 and 90.");
        }
    }
    if (body.longitude !== undefined && body.longitude !== null && body.longitude !== '') {
        const lng = Number(body.longitude);
        if (isNaN(lng) || lng < -180 || lng > 180) {
            errors.push("'longitude' must be a valid number between -180 and 180.");
        }
    }
    return errors;
}
