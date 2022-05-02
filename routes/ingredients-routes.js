const express = require('express');
const { check } = require('express-validator');
const ingredientsControllers = require('../controllers/ingredients-controllers');
const router = new express.Router();

router.get('/',ingredientsControllers.getAllIngredients);

router.get('/:iid',ingredientsControllers.getIngredientById);

router.post('/', 
[
check('name')
.not()
.isEmpty(),
check('vegan').isBoolean()
], 
ingredientsControllers.createIngredient);

router.delete('/:iid', ingredientsControllers.deleteIngredient);

router.patch('/:iid', ingredientsControllers.updateIngredient);


module.exports = router;

