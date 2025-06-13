const jwt = require('jsonwebtoken');

module.exports.authMiddleware = async (req, res, next) => {
    const { authorization } = req.headers;

    if (authorization) {
        const token = authorization.split(' ')[1];
        if (token) {
            try {
                const userInfo = await jwt.verify(token, process.env.SECRET);
                req.user = {  // Add this object
                    _id: userInfo.id,  // Make sure this matches your JWT payload
                    role: userInfo.role
                };
                req.role = userInfo.role;
                req.id = userInfo.id;
                next();
            } catch (error) {
                return res.status(401).json({ message: 'unauthorized1' });
            }
        } else {
            return res.status(401).json({ message: 'unauthorized2' });
        }
    } else {
        return res.status(401).json({ message: 'unauthorized3' });
    }
};