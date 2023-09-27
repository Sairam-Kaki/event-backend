import express, { Request, Response } from 'express';
import pool from '../config/db';
import {createUsersTable, createAdminToken, createUserToken, userExistCheck} from '../utils/utils'

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    try {
        await createUsersTable();
        const user = await userExistCheck(email);

        if (user.rowCount > 0) {
            console.log('User already Exist!');
            res.status(200).json({ message: "User Already Registered" });
        }
        else {
            const query = `
                INSERT INTO users (email, username, password)
                VALUES ($1, $2, $3);
            `;

            const result = await pool.query(query, [email, username, password]);

            console.log('User registered successfully');
            res.status(201).send('User registered successfully');
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('An error occurred during registration');
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const query = `
        SELECT * FROM users WHERE email = $1;
    `;
        const result = await pool.query(query, [email]);

        // Checking if the users data exist in the table
        if (result.rows.length === 0) {
            return res.send('Invalid credentials1');
        }

        // Checking if the password is correct
        const user = result.rows[0];
        const passwordMatch = password === user.password;
        if (!passwordMatch) {
            return res.status(401).send('Invalid credentials');
        }

        const isAdmin = user.isadmin;
        console.log("isAdmin: ", isAdmin)
        const token = isAdmin ? await createAdminToken(user.email) : await createUserToken(user.email);
        console.log("Token: ", token);
        return res.status(200).json({ message: isAdmin ? "adminLogin" : "login", token })

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('An error occurred during login');
    }
});

export default router;
