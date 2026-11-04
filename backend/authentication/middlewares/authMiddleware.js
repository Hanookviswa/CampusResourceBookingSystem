const jwt = require('jsonwebtoken');

const authenticateToken = (request, response, next) =>{

    let jwtToken;
    const authHeader = request.headers['authorization']

    if(authHeader === undefined){
        return response.status(401).send("Access Token Required");
    }

    if(authHeader !== undefined){
        jwtToken = authHeader.split(" ")[1];
        if(jwtToken === undefined){
            return response.status(401).send("Invalid Authorization Header");
        }
        jwt.verify(jwtToken,process.env.JWT_SECRET, (error,payload) =>{
            if(error){
                return response.status(401).send("Invalid or ExpiredTokens");
            }
            request.user = payload;
            next();
        })
    }

}

const authorizeAdmin = (request, response, next) => {
    if (!request.user || request.user.role !== 'admin') {
        return response.status(403).send("Admin Access Required");
    }

    next();
};



module.exports = authenticateToken;
module.exports.authorizeAdmin = authorizeAdmin;