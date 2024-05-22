import dotenv from 'dotenv';
dotenv.config();

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.SECRET_API_KEY) {
    console.log("Unauthorized Access!")
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

export default apiKeyAuth;
