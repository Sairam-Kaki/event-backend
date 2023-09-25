import cors from 'cors';
import express from 'express';
import { Pool } from 'pg';
import bodyParser from 'body-parser';
import jwt, { JwtPayload } from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// database configurations
const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '1919',
    port: 5432,
};

// connecting to database
const pool = new Pool(config);

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

// Connection to register page
app.post('/register', async (req, res) => {
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

            // Inserting the users data into the users table
            const result = await pool.query(query, [email, username, password]);

            console.log('User registered successfully');
            res.status(201).send('User registered successfully');
        }

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('An error occurred during registration');
    }
});

// async function getUserData(email: any) {
//     const query = `
//         SELECT * FROM users WHERE email = $1;
//     `;
//     const result = await pool.query(query, [email]); // Taking users data from db
//     return result;
// }


// Create JWT token
async function createUserToken(email: any) {
    const token = jwt.sign({ email }, 'user-key', { expiresIn: '1h' })
    return token
}

async function createAdminToken(email: any) {
    const token = await jwt.sign({ email }, 'admin-key', { expiresIn: '1h' })
    return token
}

// Connection to login page
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // const result = await getUserData(email);
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
        // Generating a JWT token for authenticated user
        // const token = jwt.sign({ userId: user.id }, 'tenny');
        const token = isAdmin ? await createAdminToken(user.email) : await createUserToken(user.email);
        console.log("Token: ", token);
        return res.status(200).json({ message: isAdmin ? "adminLogin" : "login", token })

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('An error occurred during login');
    }
});


// providing data to dashboard
app.get('/dashboard', (req, res) => {
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
app.get('/admindashboard', (req, res) => {
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


app.post('/admin', async (req, res) => {
    
    const {
        eventTitle,
        location,
        description,
        type,
        startDate,
        endDate,
        startTime,
        endTime,
        price
    } = req.body;
    try {
        const query = `
            INSERT INTO events (
                eventname, startdate, enddate, starttime, endtime, location, price, type, description
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `
            
        const result = await pool.query(query, [
            eventTitle,
            startDate,
            endDate,
            startTime,
            endTime,
            location,
            price,
            type,
            description
        ]);
        console.log(result)

        res.status(201).send("Event Created Successfully");
    } catch (error) {
        console.log('Error creating the event: ', error);
        res.status(500).send('An error occurred during event creation');
    }

});


app.get('/event', async (req, res) => {
    const query = `
                    SELECT * FROM events;
                `;
    const result = await pool.query(query);
    res.status(200).json({ message: "events details are sent", eventData: result.rows })
})

// Assigning a port to run the server
app.listen(8080, () => {
    console.log('Server is running on port 8080');
});

