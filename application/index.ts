import express from 'express'
import winston from 'winston'
import expressWinston from 'express-winston'
import { Pool } from 'pg';

const app = express()
const PORT = 3000

const pool = new Pool({
    user: 'express-user',
    host: '34.116.215.170',
    database: 'express-database',
    password: 'securePass',
    port: 5432,
});

app.use(
    expressWinston.logger({
        transports: [new winston.transports.Console()],
        meta: false,
        msg: 'HTTP  ',
        expressFormat: true,
        colorize: false,
        ignoreRoute: function (req, res) {
            return false
        }
    })
)

app.get('/', (req, res) => {
    res.send('You have successfully run the sisu-tech application!')
})

app.get('/health', (req, res) => {
    res.send('OK');
    res.status(200);
});

app.get('/db_connection', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release(); // Release the client back to the pool
        res.send(`Database connection test successful: ${result.rows[0].now}`);
    } catch (err) {
        res.status(500).send(`Database connection test failed`);
    }
});

app.get('/sisutech/:userId', function (req, res) {
    res.send(req.params)
})

app.all('*', function (req, res, next) {
    res.send(req.params)
})

app.listen(PORT, () => {
    console.log(`Express server is listening at ${PORT}`)
})
