const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {

    try {
        const authHeader = req.header('Authorization');
    
        const token = authHeader && authHeader.split(' ')[1];
    
        if(!token){
            return res.send({
                message: "Access Denied!"
            });
        };
        
        const verified = jwt.verify(token, process.env.SECRET_KEY);

        req.user = verified;

        next();

    } catch (error) {
      res.send({
          message: "Invalid Token!"
      });  
    };
};