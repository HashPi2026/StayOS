import { taxService } from './tax.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';
export class TaxController {
    service;
    constructor(service = taxService) {
        this.service = service;
    }
    parseId(paramId, paramName = 'ID') {
        const id = parseInt(paramId, 10);
        if (isNaN(id) || id <= 0) {
            throw new ValidationError(`Invalid ${paramName}. Must be a positive integer.`);
        }
        return id;
    }
    // ================= TAX =================
    listTaxes = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            let isActive = undefined;
            if (req.query.is_active !== undefined) {
                isActive = req.query.is_active === 'true' || req.query.is_active === '1';
            }
            const taxes = await this.service.listTaxes(clientId, isActive);
            sendSuccess(res, taxes);
        }
        catch (err) {
            next(err);
        }
    };
    getTaxById = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const taxId = this.parseId(req.params.taxId || req.params.id, 'tax ID');
            const tax = await this.service.getTaxById(clientId, taxId);
            sendSuccess(res, tax);
        }
        catch (err) {
            next(err);
        }
    };
    createTax = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const created = await this.service.createTax(clientId, req.body);
            sendCreated(res, created);
        }
        catch (err) {
            next(err);
        }
    };
    updateTax = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const taxId = this.parseId(req.params.taxId || req.params.id, 'tax ID');
            const updated = await this.service.updateTax(clientId, taxId, req.body);
            sendSuccess(res, updated);
        }
        catch (err) {
            next(err);
        }
    };
    deleteTax = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const taxId = this.parseId(req.params.taxId || req.params.id, 'tax ID');
            await this.service.deleteTax(clientId, taxId);
            sendNoContent(res);
        }
        catch (err) {
            next(err);
        }
    };
    // ================= NESTED CONFIGURATIONS =================
    listConfigurations = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const taxId = this.parseId(req.params.taxId, 'tax ID');
            let isActive = undefined;
            if (req.query.is_active !== undefined) {
                isActive = req.query.is_active === 'true' || req.query.is_active === '1';
            }
            const configs = await this.service.listConfigurations(clientId, taxId, isActive);
            sendSuccess(res, configs);
        }
        catch (err) {
            next(err);
        }
    };
    getConfigurationById = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const taxId = this.parseId(req.params.taxId, 'tax ID');
            const configId = this.parseId(req.params.configId, 'tax configuration ID');
            const config = await this.service.getConfigurationById(clientId, taxId, configId);
            sendSuccess(res, config);
        }
        catch (err) {
            next(err);
        }
    };
    createConfiguration = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const taxId = this.parseId(req.params.taxId, 'tax ID');
            const created = await this.service.createConfiguration(clientId, taxId, req.body);
            sendCreated(res, created);
        }
        catch (err) {
            next(err);
        }
    };
    updateConfiguration = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const taxId = this.parseId(req.params.taxId, 'tax ID');
            const configId = this.parseId(req.params.configId, 'tax configuration ID');
            const updated = await this.service.updateConfiguration(clientId, taxId, configId, req.body);
            sendSuccess(res, updated);
        }
        catch (err) {
            next(err);
        }
    };
    deleteConfiguration = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const taxId = this.parseId(req.params.taxId, 'tax ID');
            const configId = this.parseId(req.params.configId, 'tax configuration ID');
            await this.service.deleteConfiguration(clientId, taxId, configId);
            sendNoContent(res);
        }
        catch (err) {
            next(err);
        }
    };
}
export const taxController = new TaxController();
