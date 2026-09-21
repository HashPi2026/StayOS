import { groupService } from './group.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response.js';
import { ValidationError } from '../../utils/errors.js';

export class GroupController {
  constructor(service = groupService) {
    this.service = service;
  }

  parseId(paramId, entity = 'group') {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError(`Invalid ${entity} ID. Must be a positive integer.`);
    }
    return id;
  }

  list = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const { search, limit, offset } = req.query;
      const groups = await this.service.listGroups(clientId, { search, limit, offset });
      sendSuccess(res, groups);
    } catch (err) {
      next(err);
    }
  };

  search = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const term = req.query.q || req.query.query || req.query.search || req.query.name;
      const groups = await this.service.searchGroups(clientId, term);
      sendSuccess(res, groups);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const group = await this.service.getGroupById(clientId, id);
      sendSuccess(res, group);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const created = await this.service.createGroup(clientId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const updated = await this.service.updateGroup(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      await this.service.deleteGroup(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  // ==================== GROUP CONTACTS ====================

  listContacts = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const groupId = this.parseId(req.params.groupId || req.params.id);
      const contacts = await this.service.listGroupContacts(clientId, groupId);
      sendSuccess(res, contacts);
    } catch (err) {
      next(err);
    }
  };

  createContact = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const groupId = this.parseId(req.params.groupId || req.params.id);
      const created = await this.service.createGroupContact(clientId, groupId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  updateContact = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const contactId = this.parseId(req.params.id, 'group contact');
      const updated = await this.service.updateGroupContact(clientId, contactId, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  deleteContact = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const contactId = this.parseId(req.params.id, 'group contact');
      await this.service.deleteGroupContact(clientId, contactId);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  // ==================== GROUP DOCUMENTS ====================

  listDocuments = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const groupId = this.parseId(req.params.groupId || req.params.id);
      const documents = await this.service.listGroupDocuments(clientId, groupId);
      sendSuccess(res, documents);
    } catch (err) {
      next(err);
    }
  };

  createDocument = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const groupId = this.parseId(req.params.groupId || req.params.id);
      const created = await this.service.createGroupDocument(clientId, groupId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  updateDocument = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const docId = this.parseId(req.params.id, 'group document');
      const updated = await this.service.updateGroupDocument(clientId, docId, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  deleteDocument = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const docId = this.parseId(req.params.id, 'group document');
      await this.service.deleteGroupDocument(clientId, docId);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const groupController = new GroupController();
