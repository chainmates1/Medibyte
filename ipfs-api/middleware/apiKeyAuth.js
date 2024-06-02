import dotenv from 'dotenv';
dotenv.config();

const apiKeyAuth = (req, res, next) => {
    // console.log(req.headers);
    const apiKey = req.header('x-api-key');
    if (apiKey !== process.env.SECRET_API_KEY) {
        console.log("Unauthorized Access!")
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };

export default apiKeyAuth;
