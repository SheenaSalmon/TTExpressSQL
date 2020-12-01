'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Book.init({
    title: {type:DataTypes.STRING,
    allowNull:false,
  validate:{
    notNull:{
      msg:"Please Ennter a Title for book."
    }
  }},
    author: {type:{type:DataTypes.STRING},
  allowNull:false,
validate:{
notNull:{
  msg:"Please Enter an author for the book,"
}
}},
    genre: DataTypes.STRING,
    year: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};