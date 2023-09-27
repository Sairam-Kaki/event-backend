import express, { Request, Response } from 'express';
import pool from '../config/db';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/admin', async (req: Request, res: Response) => {
    try {
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
        console.error('Error creating the event: ', error);
        res.status(500).send('An error occurred during event creation');
    }
});

router.get('/event', async (req: Request, res: Response) => {
    try {
        const query = `
        SELECT * FROM events;
    `;
        const result = await pool.query(query);
        res.status(200).json({ message: "events details are sent", eventData: result.rows })

    } catch (error) {
        console.error('Error fetching events: ', error);
        res.status(500).send('An error occurred while fetching events');
    }
});

router.post('/bookTicket', async (req: Request, res: Response) => {
    try {
        const { token, eventId } = req.body;
        console.log("before verify")
        jwt.verify(token, 'user-key', async (err: any, data: any) => {
            console.log("after verify")

            if (err) {
                res.status(200).json({ message: "TokenExpiredError" })
            }
            else if (data.email) {
                const query = `
                INSERT INTO tickets(email, event_id, booked_date)
                    VALUES ($1, $2, $3)
                `
                const result = await pool.query(query, [data.email, eventId, new Date()]);
                console.log("ticket result: ", result)
                const query2 = `
                UPDATE events
                SET availability = availability - 1
                where eventid = $1
            `
                const result2 = await pool.query(query2, [eventId])
                res.status(201).json({ message: "Ticket booked successfully" })
                console.log("result2: ", result2)
            }
        })
    } catch (error) {
        console.error('Error booking ticket: ', error);
        res.status(500).send('An error occurred while booking the ticket');
    }
});

export default router;
