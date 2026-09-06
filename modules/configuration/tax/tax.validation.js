const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export function validateCreateTax(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    if (!body.tax_name || typeof body.tax_name !== 'string' || !body.tax_name.trim()) {
        errors.push("'tax_name' is required and must be a non-empty string.");
    }
    else if (body.tax_name.trim().length > 50) {
        errors.push("'tax_name' cannot exceed 50 characters.");
    }
    if (body.tax_type !== undefined && body.tax_type !== null) {
        if (typeof body.tax_type !== 'string') {
            errors.push("'tax_type' must be a string.");
        }
        else if (body.tax_type.trim().length > 50) {
            errors.push("'tax_type' cannot exceed 50 characters.");
        }
    }
    if (typeof body.per_day_tax !== 'boolean') {
        errors.push("'per_day_tax' is required and must be a boolean.");
    }
    if (typeof body.per_stay_tax !== 'boolean') {
        errors.push("'per_stay_tax' is required and must be a boolean.");
    }
    if (typeof body.per_day_tax === 'boolean' && typeof body.per_stay_tax === 'boolean') {
        if (body.per_day_tax === body.per_stay_tax) {
            errors.push("Tax basis check failed: exactly one of 'per_day_tax' and 'per_stay_tax' must be true (they cannot both be true or both be false).");
        }
    }
    if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
        errors.push("'is_active' must be a boolean.");
    }
    return errors;
}
export function validateUpdateTax(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    if (body.tax_name !== undefined) {
        if (typeof body.tax_name !== 'string' || !body.tax_name.trim()) {
            errors.push("'tax_name' cannot be empty.");
        }
        else if (body.tax_name.trim().length > 50) {
            errors.push("'tax_name' cannot exceed 50 characters.");
        }
    }
    if (body.tax_type !== undefined && body.tax_type !== null) {
        if (typeof body.tax_type !== 'string') {
            errors.push("'tax_type' must be a string.");
        }
        else if (body.tax_type.trim().length > 50) {
            errors.push("'tax_type' cannot exceed 50 characters.");
        }
    }
    if (body.per_day_tax !== undefined && typeof body.per_day_tax !== 'boolean') {
        errors.push("'per_day_tax' must be a boolean.");
    }
    if (body.per_stay_tax !== undefined && typeof body.per_stay_tax !== 'boolean') {
        errors.push("'per_stay_tax' must be a boolean.");
    }
    if (typeof body.per_day_tax === 'boolean' && typeof body.per_stay_tax === 'boolean') {
        if (body.per_day_tax === body.per_stay_tax) {
            errors.push("Tax basis check failed: exactly one of 'per_day_tax' and 'per_stay_tax' must be true.");
        }
    }
    if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
        errors.push("'is_active' must be a boolean.");
    }
    return errors;
}
export function validateCreateTaxConfig(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    if (body.rate === undefined || typeof body.rate !== 'number' || isNaN(body.rate) || body.rate < 0) {
        errors.push("'rate' is required and must be a non-negative number.");
    }
    else if (body.rate > 999.99) {
        errors.push("'rate' exceeds maximum allowable numeric value (999.99).");
    }
    if (!body.from_date || typeof body.from_date !== 'string' || !DATE_REGEX.test(body.from_date)) {
        errors.push("'from_date' is required and must be a valid date in YYYY-MM-DD format.");
    }
    if (!body.last_date || typeof body.last_date !== 'string' || !DATE_REGEX.test(body.last_date)) {
        errors.push("'last_date' is required and must be a valid date in YYYY-MM-DD format.");
    }
    if (body.from_date && body.last_date && DATE_REGEX.test(body.from_date) && DATE_REGEX.test(body.last_date)) {
        if (body.from_date >= body.last_date) {
            errors.push("'from_date' must be strictly before 'last_date'.");
        }
    }
    if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
        errors.push("'is_active' must be a boolean.");
    }
    return errors;
}
export function validateUpdateTaxConfig(req) {
    const errors = [];
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return ['Request body must be a JSON object.'];
    }
    if (body.rate !== undefined) {
        if (typeof body.rate !== 'number' || isNaN(body.rate) || body.rate < 0) {
            errors.push("'rate' must be a non-negative number.");
        }
        else if (body.rate > 999.99) {
            errors.push("'rate' exceeds maximum allowable numeric value (999.99).");
        }
    }
    if (body.from_date !== undefined) {
        if (typeof body.from_date !== 'string' || !DATE_REGEX.test(body.from_date)) {
            errors.push("'from_date' must be a valid date in YYYY-MM-DD format.");
        }
    }
    if (body.last_date !== undefined) {
        if (typeof body.last_date !== 'string' || !DATE_REGEX.test(body.last_date)) {
            errors.push("'last_date' must be a valid date in YYYY-MM-DD format.");
        }
    }
    if (body.from_date !== undefined && body.last_date !== undefined) {
        if (DATE_REGEX.test(body.from_date) && DATE_REGEX.test(body.last_date)) {
            if (body.from_date >= body.last_date) {
                errors.push("'from_date' must be strictly before 'last_date'.");
            }
        }
    }
    if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
        errors.push("'is_active' must be a boolean.");
    }
    return errors;
}
