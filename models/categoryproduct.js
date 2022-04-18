'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class categoryproduct extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  categoryproduct.init({
    idProduct: DataTypes.INTEGER,
    idCategory: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'categoryproduct',
  });
  return categoryproduct;
};