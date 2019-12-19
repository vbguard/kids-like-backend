const router = require('express').Router();
const passport = require('passport');
const passportUserCheck = passport.authenticate('jwt', {
	session: false
});

const prizesController = require('../controllers/prizes.controller');
// for displaying tasks
router
	.get('/', passportUserCheck, prizesController.getPrizes)
	.post('/', passportUserCheck, prizesController.createPrize)
	.delete('/:prizeId', passportUserCheck, prizesController.deletePrize)
	.patch('/:prizeId', passportUserCheck, taskController.updateTask);
module.exports = router;
