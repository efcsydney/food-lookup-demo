'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('calendars', [{
      id: 1,
      date: '2017-10-08',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 2,
      date: '2017-10-15',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('calendars', null, {});
  }
};