const Position = require('../models/position').Position;

class PositionRepository {
  static getAll() {
    return Position.findAll({
      order: [['id', 'ASC']]
    });
  }

  static async getByNameAndServiceId(criteria) {
    const { positionName, serviceId } = criteria;
    return await Position.findOne({
      where: { name: positionName, serviceId: serviceId }
    });
  }

  static createPosition(position) {
    return Position.create(position);
  }

  static updatePosition(position) {
    return Position.update(
      {
        name: position.name,
        order: position.order
      },
      {
        where: { id: position.id }
      }
    );
  }

  static bulkCreateOrUpdatePositions(positions) {
    return Position.bulkCreate(positions, { updateOnDuplicate: true });
  }
}

module.exports = {
  PositionRepository
};
