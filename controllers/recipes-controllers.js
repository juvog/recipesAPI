const Recipe = require("../models/recipe");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");
const Ingredient = require("../models/ingredient");
const deepPopulate = require("mongoose-deep-populate");

const getAllRecipes = async (req, res, next) => {
  let existingRecipes = [];
  try {
    existingRecipes = await Recipe.find();
  } catch (err) {
    return next(err);
  }
  if(!existingRecipes){
    const error = new HttpError("Aucune recette de publiée", 422);
    return next(error);
  }
  res.status(201).json({Recipes : existingRecipes});
};

const getRecipesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithRecipes;

  try {
    userWithRecipes = await User.findById(userId).populate("recipes");
  } catch (err) {
    const error = new HttpError(
      "Impossible de trouver  un résultat, veuillez recommencer",
      500
    );
    return next(error);
  }

  if (!userWithRecipes || userWithRecipes.recipes.length === 0) {
    const error = new HttpError(
      "Pas d'utilisateur avec cet id ou bien cet utilisateur n'a pas de recettes",
      404
    );
    return next(error);
  }
  res.json({
    recipes: userWithRecipes.recipes.map((recipe) =>
      recipe.toObject({ getters: true })
    ),
  });
};

const getRecipesByIngredientId = async (req, res, next) => {
  let ingredientId = req.params.iid;

  let existingIngredient;
  try {
    existingIngredient = await Ingredient.findById(ingredientId);
  } catch (err) {
    return next(err);
  }

  if (!existingIngredient) {
    const error = new HttpError("Ingredient does not exist", 404);
  }
  let ingredientRecipes = existingIngredient.recipes;
  res.status(201).json({ Recipes: ingredientRecipes });
};


const postRecipes = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError("Erreur de saisie de données", 422);
    return next(error);
  }

  const { name, description, ingredients, creator } = req.body;

  const createdRecipe = new Recipe({
    name,
    description,
    ingredients,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Impossible de trouver l'utilisateur", 404);
    return next(error);
  }

  let existingRecipe;
  try {
    existingRecipe = await Recipe.findOne({ name: name });
  } catch (err) {
    return next(err);
  }

  if (existingRecipe) {
    const error = new HttpError("Une recette avec ce nom existe déjà !", 422);
    return next(error);
  }

  let existingIngredient;

  let les_ingredients = [];

  for (const ing of ingredients) {
    try {
      existingIngredient = await Ingredient.findById(ing);
      les_ingredients.push(existingIngredient);
    } catch (err) {
      const error = new HttpError(
        "Attention, au moins un des ingrédients n'est pas répertorié. ",
        404
      );
      return next(error);
    }
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdRecipe.save({ session: sess });
    user.recipes.push(createdRecipe);
    await user.save({ session: sess });

    for (let i = 0; i < les_ingredients.length; i++) {
      les_ingredients[i].recipes.push(createdRecipe);
      await les_ingredients[i].save({ session: sess });
    }

    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Impossible d'enregistrer la recette, réessayer plus tard",
      500
    );
    return next(err);
  }

  res.status(201).json({ Message: "recette créée", Recipe: createdRecipe });
};


const updateRecipeById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError("Entrée incorrecte", 422);
    return next(error);
  }

  const { name, description, ingredients } = req.body;
  const recipeId = req.params.rid;
  let existingIngredient;
  let ingredientsList = [];

  for (const ing of ingredients) {
    try {
      existingIngredient = await Ingredient.findById(ing);
      ingredientsList.push(existingIngredient);
    } catch (err) {
      return next(err);
    }
  }

  if (ingredientsList.length != ingredients.length) {
    const error = new HttpError(
      "Au moins un des ingrédients saisis n'est pas répertorié",
      422
    );
    return next(error);
  }

  let existingRecipe;

  try {
    existingRecipe = await Recipe.findById(recipeId);
  } catch (err) {
    return next(err);
  }

  if (!existingRecipe) {
    const error = new HttpError("La recette n'existe pas");
    return next(error);
  }

  existingRecipe.name = name;
  existingRecipe.description = description;
  existingRecipe.ingredients = ingredients;

  try {
    await existingRecipe.save();
  } catch (err) {
    return next(err);
  }

  res
    .status(201)
    .json({ Message: "recette mise à jour", Recipe: existingRecipe });
};


const deleteRecipeById = async (req, res, next) => {
  let recipeId = req.params.rid;

  let existingRecipe;
  try {
    existingRecipe = await Recipe.findById(recipeId)
      .populate("ingredients")
      .populate("creator");
  } catch (err) {
    return next(err);
  }

  if (!existingRecipe) {
    const error = new HttpError("Recipe does not exist", 404);
    return next(error);
  }

  let usedIngredients = [];
  for (let i = 0; i < existingRecipe.ingredients.length; i++) {
    console.log(existingRecipe.ingredients[i]);
    usedIngredients.push(existingRecipe.ingredients[i]);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await existingRecipe.creator.recipes.pull(existingRecipe);
    await existingRecipe.creator.save({ session: sess });

    for (let i = 0; i < usedIngredients.length; i++) {
      await usedIngredients[i].recipes.pull(existingRecipe);
      await usedIngredients[i].save();
    }

    await existingRecipe.remove({ session: sess });
    sess.commitTransaction();
  } catch (err) {
    return next(err);
  }

  res.status(200).json({ Message: "Recette supprimée" });
};

exports.getAllRecipes = getAllRecipes;
exports.getRecipesByUserId = getRecipesByUserId;
exports.getRecipesByIngredientId = getRecipesByIngredientId;
exports.postRecipes = postRecipes;
exports.updateRecipeById = updateRecipeById;
exports.deleteRecipeById = deleteRecipeById;
