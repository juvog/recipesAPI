const mongoose = require('mongoose');
const Schema = mongoose.Schema

recipeSchema = new Schema({
name : { type : String, required : true},
description : {type: String, required : true },
ingredients : [{ type: mongoose.Types.ObjectId,  ref: 'Ingredient'}],
creator : {type:mongoose.Types.ObjectId, ref:'User'}
});


module.exports= mongoose.model('Recipe', recipeSchema);







