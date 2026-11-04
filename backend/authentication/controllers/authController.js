const bcrypt = require('bcryptjs')
const initializeDb = require('../../database/database.js')
const jwt = require('jsonwebtoken')




const signup = async (request,response) =>{
    try{
        
        const db = initializeDb.getDb()

        const {name,email,password} = request.body
        
        if(!name || !email || !password){
            return response.status(400).send("All Fields Are Required");    
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const selectUserQuery = `SELECT * FROM users WHERE email=?`;
        const dbUser = await db.get(selectUserQuery,[email]);
        if(dbUser === undefined){
            const createUserQuery = `INSERT INTO users(name,email,password)
                                    VALUES(?,?,?)`
            await db.run(createUserQuery,[name,email,hashedPassword]);
            return response.status(201).send("User Created Successfully");
        }else{
            
            return response.status(400).send("User Already Exists");
        }

    }catch(e){
       console.log(`DB Error: ${e.message}`);
       return response.status(500).send("Internal Server Error");
    }
    
}

const login = async (request, response) =>{
     try{
        const db = initializeDb.getDb();

    const {email,password} = request.body;
    if (!email || !password) {
        return response.status(400).send("Email and password are required");
    }
    const selectUserQuery = `SELECT * FROM users WHERE 
                              email=?`;
    const dbUser = await db.get(selectUserQuery,[email]);
    if(dbUser === undefined){
        return response.status(400).send("User Not Exists");

    }else{
        const isPasswordMatched = await bcrypt.compare(password,dbUser.password);
        if(isPasswordMatched===true){
            const payload = {
                email:dbUser.email,
                role: dbUser.role
            };
            const jwtToken = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"1h"
            });
            return response.status(200).send({jwtToken});
        }else{
            return response.status(400).send("Invalid Password");
        }
    }
     }catch(e){
        console.log(`LogIn Error ${e.message}`);
        response.status(500).send("Internal Server Error");
     }
    
}

module.exports = {signup,login};