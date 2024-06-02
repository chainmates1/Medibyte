import express from 'express';
import patientDataRoutes from './routes/route.js';
import apiKeyAuth from './middleware/apiKeyAuth.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: '*', // Replace with your frontend's domain
  methods: ['GET', 'POST'], // Specify the methods you want to allow
  allowedHeaders: '*' // Specify the headers you want to allow
};

// Middleware
app.use(express.json()); // For parsing JSON request bodies
// app.use(apiKeyAuth);
app.use(cors(corsOptions));


// Routes
app.use('/', patientDataRoutes); 

// Error handling middleware (Keep this at the end)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
