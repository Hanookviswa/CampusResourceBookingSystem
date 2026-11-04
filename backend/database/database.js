const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const fs = require('fs')

const dbPath = path.join(__dirname, "campus.db")
let db=null;
const initializeDb = async () =>{
    try{
        db = await open({
        filename: dbPath,
        driver: sqlite3.Database
        })
        const sqlPath = path.join(__dirname,'init.sql');
        const sqlQueries = fs.readFileSync(sqlPath, 'utf8');
        await db.exec(sqlQueries);


        console.log("Database Connectede Successfully");
        console.log("Tables Created Successfully");

        return db;

    }catch(error){
        console.log(`Database Initialization Error ${error.message}`);
        throw error;
    }
    
}
initializeDb.getDb = () => db;
module.exports = initializeDb;