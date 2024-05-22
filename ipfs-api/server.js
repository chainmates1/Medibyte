import express from 'express';
import patientDataRoutes from './routes/route.js';
import apiKeyAuth from './middleware/apiKeyAuth.js';

const app = express();
const port = 3000;

// Middleware
app.use(express.json()); // For parsing JSON request bodies
app.use(apiKeyAuth);

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
