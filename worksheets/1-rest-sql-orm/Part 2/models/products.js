'use strict';
module.exports = (sequelize, DataTypes) => {
  const products = sequelize.define('products', {
    title: DataTypes.STRING,
    price: DataTypes.FLOAT,
    tags: DataTypes.ARRAY(DataTypes.TEXT)
  }, {
    timestamps : false
  });
  products.associate = function(models) {
    products.hasMany(models.purchase_items, { onDelete: 'CASCADE' });
  };
  return products;
};


