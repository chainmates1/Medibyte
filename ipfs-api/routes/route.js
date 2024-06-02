import express from 'express';
import {getTestData,setTestData,setNftData} from '../controllers/routeController.js';

const router = express.Router();

router.get('/getTestData', getTestData);
router.post('/setTestData', setTestData);
router.post('/setNftData',setNftData);
export default router;