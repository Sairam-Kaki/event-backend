import express, { Request, Response } from 'express';
import pool from '../config/db';
import jwt, { JwtPayload } from 'jsonwebtoken';


const router = express.Router();

// providing data to dashboard
router.get('/dashboard', (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, 'user-key', async (err, data: any) => {

            if (err) {
                res.status(200).json({ message: "TokenExpiredError" })
            }
            else if (data.email) {
                const query = `
                    SELECT * FROM users WHERE email ='${data.email}';
                `;
                const result = await pool.query(query);
                res.status(200).json({ message: "user deatils are sent", userData: result.rows[0] })
            }
        })
    }
    else {
        res.status(200).json({ message: "token not found" })
    }
})

// For admin dashboard
router.get('/admindashboard', (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, 'admin-key', async (err, data: any) => {

            if (err) {
                res.status(200).json({ message: "TokenExpiredError" })
            }
            else if (data.email) {
                const query = `
                    SELECT * FROM users WHERE email ='${data.email}';
                `;
                const result = await pool.query(query);
                res.status(200).json({ message: "admin deatils are sent", userData: result.rows[0] })
            }
        })
    }
    else {
        res.status(200).json({ message: "token not found" })
    }
})

export default router;
