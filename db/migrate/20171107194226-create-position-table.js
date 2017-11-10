'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('positions', {
      id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
          type: Sequelize.STRING,
          unique: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }

    }, {
      charset: 'utf8'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('positions');
  }
};