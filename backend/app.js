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