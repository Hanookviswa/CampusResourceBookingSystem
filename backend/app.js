const express = require('express')
const cors = require('cors')
require("dotenv").config();
const initializeDb = require('./database/database.js')
const authRouter = require('./authentication/routes/authRoutes.js')
const authenticateToken = require('./authentication/middlewares/authMiddleware.js')
const bookingRouter = require('./bookings/routes/bookingRoutes.js');


const app = express()

app.use(cors());
app.use(express.json())
app.use('/api/auth',authRouter)
app.use('/api', bookingRouter);


app.post('/api/setup-admin', async (request, response) => {
    try {
        const setupKey = request.headers['x-admin-setup-key'];

        if (!process.env.ADMIN_SETUP_KEY ||
            setupKey !== process.env.ADMIN_SETUP_KEY) {
            return response.status(403).send("Unauthorized");
        }

        const db = initializeDb.getDb();
        const { email } = request.body;

        if (!email) {
            return response.status(400).send("Email is required");
        }

        const existingAdmin = await db.get(
            `SELECT COUNT(*) AS count FROM users WHERE role = 'admin'`
        );

        if (existingAdmin.count > 0) {
            return response.status(403).send("Admin already exists");
        }

        const result = await db.run(
            `UPDATE users SET role = 'admin' WHERE email = ?`,
            [email]
        );

        if (result.changes === 0) {
            return response.status(404).send("User not found");
        }

        return response.status(200).send("Admin created successfully");

    } catch (error) {
        console.log(`Admin Setup Error: ${error.message}`);
        return response.status(500).send("Internal Server Error");
    }
});


const PORT = process.env.PORT || 3000;


const startServer = async () =>{
    try{
        await initializeDb()
        app.listen(PORT, ()=>{
            console.log(`server running at http://localhost:${PORT}`);
        })


    }catch(err){
        console.log(`DB Error :${err.message}`)
    }

}
startServer()

app.get('/', (request,response)=>{
    response.send('Create API Successfully');
})


app.get('/api/protected', authenticateToken, (request, response) => {
    response.status(200).send({
        message: "Access granted",
        user: request.user
    });
});



module.exports = app;