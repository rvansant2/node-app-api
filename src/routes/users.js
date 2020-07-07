import express from 'express';
import { hash as bcryptHash, compare as bcryptCompare } from 'bcrypt';
import omit from 'lodash/omit';

import winstonLogger from '../lib/logger/winston';
import { authenticateToken, generateAuthToken } from '../middleware/authenticate/jwtAuthenticate';
import userModel from '../models/userModel';

const router = express.Router();

router
  .get('/:id?', authenticateToken, async (req, res, next) => {
    try {
      if (req.decoded.isAuthorized && !req.params.id) {
        const users = await userModel.find({ status: 'active' }).select('-password');

        res.status(200).json({
          users,
          user: req.decoded.user,
          token: req.decoded.jwtToken,
          success: true,
          message: 'Successfully retrieved list of users.',
        });
      } else if (req.decoded.isAuthorized && req.params.id) {
        const userDetails = await userModel.findOne({ _id: req.params.id }).select('-password');

        res.status(200).json({
          userDetails,
          user: req.decoded.user,
          token: req.decoded.jwtToken,
          success: true,
          message: `Successfully retrieved user details for id: ${req.params.id}.`,
        });
      } else {
        res.status(404).json({
          success: true,
          message: 'You are not a valid authorized user.',
        });
        throw new Error('You are not a valid authorized user.');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      winstonLogger.error(`Error: ${e.message}`);
      next();
    }
  })
  .post('/', async (req, res, next) => {
    const {
      // eslint-disable-next-line
      firstName,
      lastName,
      email,
      username,
      password,
    } = req.body;
    try {
      const user = await userModel.findOneOrCreate(
        { email },
        {
          firstName,
          lastName,
          email,
          username,
          password: await bcryptHash(password, 10),
          status: 'active',
        },
      );
      const token = await generateAuthToken({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        status: user.status,
      });
      const savedUser = omit(user.toObject(), ['password']);
      res.status(200).json({
        user: savedUser,
        token,
        success: true,
        message: 'You successfully created a user.',
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      winstonLogger.error(`Error: ${e.message}`);
      next();
    }
  })
  .post('/login', async (req, res, next) => {
    try {
      const { password } = req.body;
      const query = req.body.username ? { username: req.body.username } : { email: req.body.email };
      const user = await userModel.findOne(query);
      if (user) {
        const validUser = await bcryptCompare(password, user.password);
        if (!validUser) {
          throw new Error('User login not a valid user.');
        }
        const token = generateAuthToken({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          status: user.status,
        });
        const loggedInUser = omit(user.toObject(), ['password']);
        res.status(200).json({
          user: loggedInUser,
          token,
          success: true,
          message: 'You have successfully logged in.',
        });
      } else {
        res.status(200).json({
          success: false,
          message: 'Please enter valid credentials.',
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      winstonLogger.error(`Error: ${e.message}`);
      next();
    }
  });

export default router;
