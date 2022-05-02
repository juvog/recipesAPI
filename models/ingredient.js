const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ingredientSchema = new Schema( {
    name: {type : String, required : true},
    vegan :{type: Boolean, required: true }, 
    recipes : [{ type: mongoose.Types.ObjectId, ref: 'Recipe'}],
});

module.exports = mongoose.model('Ingredient', ingredientSchema);






