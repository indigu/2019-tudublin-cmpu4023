'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    details: DataTypes.STRING
  }, {
    timestamps : false
  });
  users.associate = function(models) {
    users.hasMany(models.purchases, { onDelete: 'CASCADE' });
  };
  return users;
};