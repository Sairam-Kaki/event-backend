import pool from "../config/db";
import jwt from 'jsonwebtoken';

// Function to create a users table in DB if not exist before
async function createUsersTable() {
    try {
        const query = `
        CREATE TABLE IF NOT EXISTS Users(
            Email varchar(255) PRIMARY KEY,
            userName varchar(255),
            mobile int UNIQUE,
            password varchar(25),
            isAdmin boolean
        );
        `;

        const result = await pool.query(query);

        // console.log('Table is ready');
    } catch (error) {
        console.error('Error creating users table:', error);
    }
}

async function userExistCheck(email: string) {
    const query = `
        select * from users
        where email = $1
    `;
    const result = await pool.query(query, [email]);
    return result;
}

// Create JWT token
async function createUserToken(email: any) {
    const token = jwt.sign({ email }, 'user-key', { expiresIn: '1h' })
    return token
}

async function createAdminToken(email: any) {
    const token = jwt.sign({ email }, 'admin-key', { expiresIn: '1h' })
    return token
}

export {createUsersTable, createAdminToken, createUserToken, userExistCheck}