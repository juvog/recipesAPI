const express = require('express');
const {check} = require('express-validator');

const router = express.Router();
const recipesController = require('../controllers/recipes-controllers');


router.get('/', recipesController.getAllRecipes);

router.get('/user/:uid', recipesController.getRecipesByUserId);

router.get('/ingredient/:iid', recipesController.getRecipesByIngredientId);

router.post('/',
[check('name')
.not()
.isEmpty(),
check('description').isLength({min: 5})
],
recipesController.postRecipes);


router.patch('/:rid',
[check('name')
.not()
.isEmpty(),
check('description').isLength({min: 5})
],
 recipesController.updateRecipeById);
 
router.delete('/:rid', recipesController.deleteRecipeById);

module.exports = router;
