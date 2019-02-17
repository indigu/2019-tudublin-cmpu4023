'use strict';
module.exports = (sequelize, DataTypes) => {
  const purchases = sequelize.define('purchases', {
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    state: DataTypes.STRING,
    zipcode: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    timestamps : false
  });
  purchases.associate = function(models) {
    purchases.belongsTo(models.users);
    purchases.hasMany(models.purchase_items, { onDelete: 'CASCADE' });
  };
  return purchases;
};