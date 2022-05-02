const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const usersRoutes = require("./routes/users-routes.js");
const ingredientsRoutes = require("./routes/ingredients-routes.js");
const recipesRoutes = require("./routes/recipes-routes.js");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());
app.use("/api/user", usersRoutes);
app.use("/api/ingredient", ingredientsRoutes);
app.use("/api/recipe", recipesRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    'mongodb+srv://<username>:<password>@cluster0.6mh46.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
