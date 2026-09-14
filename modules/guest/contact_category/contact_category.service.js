import { pool } from '../../../db/pool.js';
import { ConflictError, NotFoundError, ValidationError } from '../../../utils/errors.js';

export class ContactCategoryService {
  async listCategories(clientId) {
    const query = `
      SELECT cc.*,
        (SELECT COUNT(*)::int FROM contact c WHERE c.contact_category_id = cc.contact_category_id) AS contact_count
      FROM contact_category cc
      WHERE cc.client_id = $1
      ORDER BY cc.category_name ASC;
    `;
    const { rows } = await pool.query(query, [clientId]);
    return rows;
  }

  async getCategoryById(clientId, categoryId) {
    const query = `
      SELECT cc.*,
        (SELECT COUNT(*)::int FROM contact c WHERE c.contact_category_id = cc.contact_category_id) AS contact_count
      FROM contact_category cc
      WHERE cc.contact_category_id = $1 AND cc.client_id = $2
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [categoryId, clientId]);
    if (rows.length === 0) {
      throw new NotFoundError('Contact Category', categoryId);
    }
    return rows[0];
  }

  async createCategory(clientId, data) {
    const { category_name } = data;
    if (!category_name || !category_name.trim()) {
      throw new ValidationError('Category name is required.');
    }

    const insertQuery = `
      INSERT INTO contact_category (client_id, category_name)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [clientId, category_name.trim()]);
    return rows[0];
  }

  async updateCategory(clientId, categoryId, data) {
    const { category_name } = data;
    if (!category_name || !category_name.trim()) {
      throw new ValidationError('Category name is required.');
    }

    // Check existence
    const { rows: existing } = await pool.query(
      'SELECT contact_category_id FROM contact_category WHERE contact_category_id = $1 AND client_id = $2',
      [categoryId, clientId]
    );
    if (existing.length === 0) {
      throw new NotFoundError('Contact Category', categoryId);
    }

    const updateQuery = `
      UPDATE contact_category
      SET category_name = $1
      WHERE contact_category_id = $2 AND client_id = $3
      RETURNING *;
    `;
    const { rows } = await pool.query(updateQuery, [category_name.trim(), categoryId, clientId]);
    return rows[0];
  }

  async deleteCategory(clientId, categoryId) {
    // Check existence
    const { rows: existing } = await pool.query(
      'SELECT contact_category_id FROM contact_category WHERE contact_category_id = $1 AND client_id = $2',
      [categoryId, clientId]
    );
    if (existing.length === 0) {
      throw new NotFoundError('Contact Category', categoryId);
    }

    // Check if any contact references this category
    const { rows: contactCount } = await pool.query(
      'SELECT COUNT(*)::int AS count FROM contact WHERE contact_category_id = $1 AND client_id = $2',
      [categoryId, clientId]
    );
    if (contactCount[0]?.count > 0) {
      throw new ConflictError(
        `Cannot delete contact category because it is currently assigned to ${contactCount[0].count} contact record(s).`
      );
    }

    await pool.query(
      'DELETE FROM contact_category WHERE contact_category_id = $1 AND client_id = $2',
      [categoryId, clientId]
    );
    return true;
  }
}

export const contactCategoryService = new ContactCategoryService();
