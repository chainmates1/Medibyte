const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

router.get('/getData', routeController.getPatientDataArray);
router.post('/createData', routeController.createPatientDataArray);
router.patch('/updateData', routeController.updatePatientDataArray);

module.exports = router;
