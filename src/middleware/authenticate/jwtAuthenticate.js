import jwt from 'jsonwebtoken';
import jwtDecode from 'jwt-decode';

import userModel from '../../models/userModel';

const options = { expiresIn: process.env.JWT_EXPIRES_TIME };

const authenticateToken = async (req, res, next) => {
  let result;
  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      result = jwt.verify(token, process.env.JWT_SECRET, options);
      req.decoded = {};
      req.decoded.user = result;
      const user = await userModel
        .findOne({
          email: result.email,
          status: 'active',
        })
        .select('-password');
      req.decoded.isAuthorized = user;
      req.decoded.jwtToken = token;
      next();
    } catch (err) {
      throw new Error(err);
    }
  } else {
    result = {
      success: false,
      error: 'Authentication error: a token is required.',
    };
    res.status(401).json(result);
  }
};

const generateAuthToken = payload => {
  const jwtSecret = process.env.JWT_SECRET;
  return jwt.sign(payload, jwtSecret, options);
};

const decodeUserToken = token => jwtDecode(token, '', true);

export { authenticateToken, generateAuthToken, decodeUserToken };
