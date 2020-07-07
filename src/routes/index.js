import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  const baseJSON = { success: true, message: 'Healthy check!' };
  res.status(200).json(baseJSON);
  next();
});

export default router;
