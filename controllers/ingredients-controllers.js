const Ingredient = require("../models/ingredient");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");


const getAllIngredients = async (req, res, next) => {
  let existingIngredients = [];
  try {
    existingIngredients = await Ingredient.find();
  } catch (err) {
    return next(err);
  }

  if (!existingIngredients) {
    const error = new HttpError("There are no ingredients !", 422);
    return next(error);
  }
  res.status(201).json({ Ingredients: existingIngredients });
};


const getIngredientById = async (req, res, next) => {
  const ingredientId = req.params.iid;

  let ingredient;
  try {
    ingredient = await Ingredient.findById(ingredientId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an ingredient.",
      500
    );
    return next(error);
  }

  if (!ingredient) {
    const error = new HttpError(
      "Could not fin an ingredient for the provided id",
      404
    );
    return next(error);
  }

  res.json({ ingredient: ingredient.toObject({ getters: true }) });
};



const createIngredient = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError("Erreur de rentrée de données ", 422);
    return next(error);
  }
  const { name, vegan } = req.body;
  let existingIngredient;
  try {
    existingIngredient = await Ingredient.findOne({ name: name });
  } catch (err) {
    const error = new HttpError(
      "Erreur, veuillez recommencez la recherche plus tard",
      500
    );
    return next(error);
  }

  if (existingIngredient) {
    const error = new HttpError("Ingredient exists already ! ", 422);
    return next(error);
  }
  const createdIngredient = new Ingredient({
    name,
    vegan,
  });
  try {
    await createdIngredient.save();
  } catch (err) {
    const error = new HttpError(err, 500);
    return next(error);
  }

  res.status(201).json({ ingredient: createdIngredient });
};


const deleteIngredientById = async (req, res, next) => {
  const idIngredient = req.params.iid;
  let existingIngredient;
  try {
    existingIngredient = await Ingredient.findById(idIngredient);
  } catch (err) {
    const error = new HttpError(
      "problème de connexion avec la base de données",
      500
    );
    return next(err);
  }

  if (!existingIngredient) {
    const error = new HttpError("Aucun ingrédient ne correspond à cet id", 404);
    return next(error);
  }

  try {
    await existingIngredient.remove();
  } catch (err) {
    const error = new HttpError("Suppression impossible", 404);
    return next(error);
  }

  res.status(201).json({ Message: "Élément supprimé" });
};


const updateIngredientById = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors) {
    const error = new HttpError("Données saisies incorrectes", 422);
    return next(error);
  }
  const idIngredient = req.params.iid;
  let existingIngredient;
  try {
    existingIngredient = await Ingredient.findById(idIngredient);
  } catch (err) {
    const error = new HttpError(
      "problème de connexion avec la base de données",
      500
    );
    return next(error);
  }

  if (!existingIngredient) {
    const error = new HttpError("pas d'ingrédient correspond à l'id", 404);
    return next(err);
  }

  const { name, vegan } = req.body;
  let updatedIngredient;
  try {
    updatedIngredient = await existingIngredient.update({
      name: name,
      vegan: vegan,
    });
  } catch (err) {
    const error = new HttpError(
      "problème de connexion avec la base de données",
      500
    );
    return next(err);
  }
  res.status(201).json({ message: "Ingrédient mis à jour" });
};

exports.getAllIngredients = getAllIngredients;
exports.getIngredientById = getIngredientById;
exports.createIngredient = createIngredient;
exports.deleteIngredient = deleteIngredientById;
exports.updateIngredient = updateIngredientById;
