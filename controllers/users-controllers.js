const User = require("../models/user.js");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");


const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next(err);
  }

  if (!users) {
    const error = new HttpError("Aucun utilisateur", 500);
    return next(error);
  }
  res
    .status(201)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};


const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError("Données saisies invalides", 500);
    return next(error);
  }

  const { name, email, password, address  } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(err);
  }

  if (existingUser) {
    const error = new HttpError("Utilisateur déjà existant", 422);
    return next(error);
  }

  let createdUser = new User({ name, email, password, address  });
  try {
    await createdUser.save();
  } catch (err) {
    return next(err);
  }

  res.status(201).json({ user: createdUser });
};


const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(err);
  }


  if (!existingUser || existingUser.password != password){
      const Error = new HttpError("Utilisateur ou mot de passe erroné", 500)
      return next (Error);
  }

  res.json({message : "Utilisateur connecté"});
};

exports.getUsers = getUsers;
exports.login = login;
exports.signup = signup;

