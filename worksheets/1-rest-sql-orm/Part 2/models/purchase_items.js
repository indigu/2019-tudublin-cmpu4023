'use strict';
module.exports = (sequelize, DataTypes) => {
  const purchase_items = sequelize.define('purchase_items', {
    purchase_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    quantity: DataTypes.INTEGER,
    state: DataTypes.STRING
  }, {
    timestamps : false
  });
  purchase_items.associate = function(models) {
    purchase_items.belongsTo(models.purchases);
    purchase_items.belongsTo(models.products);
  };
  return purchase_items;
};