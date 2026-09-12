import { pool, query } from '../../../db/pool';
import { UserEntity, CreateUserDTO, UpdateUserDTO } from './user.types';

export class UserRepository {
  async findMany(clientId: string): Promise<UserEntity[]> {
    const text = `
      SELECT
        u.user_id,
        u.client_id,
        u.role_id,
        u.user_name,
        u.description,
        u.is_active,
        u.phone,
        u.department,
        u.avatar_url,
        u.initials,
        u.created_at,
        u.updated_at,
        r.role_name,
        r.short_name as role_code,
        r.role_type,
        c.username,
        c.email,
        c.login_email,
        c.last_login_at
      FROM app_user u
      LEFT JOIN role_privilege r ON u.role_id = r.role_id
      LEFT JOIN user_login_credential c ON u.user_id = c.user_id
      WHERE u.client_id = $1 OR $1 = '*'
      ORDER BY u.user_id ASC;
    `;
    const res = await query<UserEntity>(text, [clientId]);
    return res.rows;
  }

  async findById(clientId: string, userId: number): Promise<UserEntity | null> {
    const text = `
      SELECT
        u.user_id,
        u.client_id,
        u.role_id,
        u.user_name,
        u.description,
        u.is_active,
        u.phone,
        u.department,
        u.avatar_url,
        u.initials,
        u.created_at,
        u.updated_at,
        r.role_name,
        r.short_name as role_code,
        r.role_type,
        c.username,
        c.email,
        c.login_email,
        c.last_login_at
      FROM app_user u
      LEFT JOIN role_privilege r ON u.role_id = r.role_id
      LEFT JOIN user_login_credential c ON u.user_id = c.user_id
      WHERE (u.client_id = $1 OR $1 = '*') AND u.user_id = $2
      LIMIT 1;
    `;
    const res = await query<UserEntity>(text, [clientId, userId]);
    return res.rows[0] || null;
  }

  async create(clientId: string, data: CreateUserDTO): Promise<UserEntity> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Resolve role_id if not provided
      let roleId = data.role_id;
      if (!roleId && data.role_name) {
        const roleRes = await client.query(
          `SELECT role_id FROM role_privilege WHERE (client_id = $1 OR client_id = 'DIS_001') AND (LOWER(role_name) = LOWER($2) OR LOWER(short_name) = LOWER($2)) LIMIT 1;`,
          [clientId, data.role_name]
        );
        if (roleRes.rows[0]) {
          roleId = roleRes.rows[0].role_id;
        }
      }
      if (!roleId) {
        // Default to Front Desk Associate (role_id 2) or first available
        const defaultRoleRes = await client.query(
          `SELECT role_id FROM role_privilege WHERE client_id = $1 OR client_id = 'DIS_001' ORDER BY role_id ASC LIMIT 1;`,
          [clientId]
        );
        roleId = defaultRoleRes.rows[0]?.role_id || 2;
      }

      const initials = data.initials || data.user_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

      // Insert into app_user
      const userRes = await client.query(
        `
        INSERT INTO app_user (
          client_id, role_id, user_name, description, is_active, phone, department, avatar_url, initials
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING user_id, client_id, role_id, user_name, description, is_active, phone, department, avatar_url, initials, created_at, updated_at;
        `,
        [
          clientId,
          roleId,
          data.user_name.trim(),
          data.description || null,
          data.is_active ?? true,
          data.phone || null,
          data.department || 'Front Desk Operations',
          data.avatar_url || null,
          initials,
        ]
      );
      const newUser = userRes.rows[0];

      // Insert into user_login_credential
      const generatedUsername = data.username || data.email.split('@')[0].toLowerCase();
      await client.query(
        `
        INSERT INTO user_login_credential (
          user_id, username, email, login_email, password_hash, is_active
        ) VALUES ($1, $2, $3, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE SET
          username = EXCLUDED.username,
          email = EXCLUDED.email,
          login_email = EXCLUDED.login_email;
        `,
        [
          newUser.user_id,
          generatedUsername,
          data.email.trim().toLowerCase(),
          '$2b$10$stayos_mock_hash_destin_2026',
          data.is_active ?? true,
        ]
      );

      await client.query('COMMIT');
      return (await this.findById(clientId, newUser.user_id))!;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async update(clientId: string, userId: number, data: UpdateUserDTO): Promise<UserEntity | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existing = await this.findById(clientId, userId);
      if (!existing) {
        await client.query('ROLLBACK');
        return null;
      }

      let roleId = data.role_id !== undefined ? data.role_id : existing.role_id;
      if (data.role_name && !data.role_id) {
        const roleRes = await client.query(
          `SELECT role_id FROM role_privilege WHERE (client_id = $1 OR client_id = 'DIS_001') AND (LOWER(role_name) = LOWER($2) OR LOWER(short_name) = LOWER($2)) LIMIT 1;`,
          [clientId, data.role_name]
        );
        if (roleRes.rows[0]) {
          roleId = roleRes.rows[0].role_id;
        }
      }

      await client.query(
        `
        UPDATE app_user
        SET
          role_id = COALESCE($3, role_id),
          user_name = COALESCE($4, user_name),
          description = CASE WHEN $5::boolean THEN $6 ELSE description END,
          is_active = COALESCE($7, is_active),
          phone = CASE WHEN $8::boolean THEN $9 ELSE phone END,
          department = CASE WHEN $10::boolean THEN $11 ELSE department END,
          avatar_url = CASE WHEN $12::boolean THEN $13 ELSE avatar_url END,
          initials = CASE WHEN $14::boolean THEN $15 ELSE initials END,
          updated_at = CURRENT_TIMESTAMP
        WHERE client_id = $1 AND user_id = $2;
        `,
        [
          clientId,
          userId,
          roleId,
          data.user_name ? data.user_name.trim() : null,
          data.description !== undefined,
          data.description || null,
          data.is_active,
          data.phone !== undefined,
          data.phone || null,
          data.department !== undefined,
          data.department || null,
          data.avatar_url !== undefined,
          data.avatar_url || null,
          data.initials !== undefined,
          data.initials || null,
        ]
      );

      if (data.email || data.username || data.is_active !== undefined) {
        await client.query(
          `
          UPDATE user_login_credential
          SET
            email = COALESCE($2, email),
            login_email = COALESCE($2, login_email),
            username = COALESCE($3, username),
            is_active = COALESCE($4, is_active),
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1;
          `,
          [
            userId,
            data.email ? data.email.trim().toLowerCase() : null,
            data.username ? data.username.trim() : null,
            data.is_active,
          ]
        );
      }

      await client.query('COMMIT');
      return await this.findById(clientId, userId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async toggleStatus(clientId: string, userId: number, isActive: boolean): Promise<UserEntity | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE app_user SET is_active = $3, updated_at = CURRENT_TIMESTAMP WHERE client_id = $1 AND user_id = $2;`,
        [clientId, userId, isActive]
      );
      await client.query(
        `UPDATE user_login_credential SET is_active = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1;`,
        [userId, isActive]
      );
      await client.query('COMMIT');
      return await this.findById(clientId, userId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async delete(clientId: string, userId: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Delete credentials first (or cascade)
      await client.query(`DELETE FROM user_login_credential WHERE user_id = $1;`, [userId]);
      const res = await client.query(`DELETE FROM app_user WHERE client_id = $1 AND user_id = $2;`, [clientId, userId]);
      await client.query('COMMIT');
      return (res.rowCount || 0) > 0;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
