const mongoose = require('mongoose');
const Schema = mongoose.Schema;

userSchema = new Schema ({
    name: {type : String, required : true},
    email : {type : String, required : true},
    password : {type : String, required : true},
    address : {type : String },
    recipes : [{ type: mongoose.Types.ObjectId, ref: 'Recipe'}],

});

module.exports = mongoose.model('User', userSchema);
