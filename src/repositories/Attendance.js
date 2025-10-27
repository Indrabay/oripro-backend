const AttendanceModel = require('../models/Attendance');

class AttendanceRepository {
  constructor() {
    this.attendanceModel = AttendanceModel;
  }

  async create(data, transaction = null) {
    const options = transaction ? { transaction } : {};
    return await this.attendanceModel.create(data, options);
  }

  async findById(id) {
    return await this.attendanceModel.findByPk(id);
  }

  async findTodayAttendance(userId, assetId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.attendanceModel.findOne({
      where: {
        user_id: userId,
        asset_id: assetId,
        created_at: {
          [require('sequelize').Op.gte]: today,
          [require('sequelize').Op.lt]: tomorrow
        }
      },
      order: [['created_at', 'DESC']]
    });
  }

  async findTodayCheckIn(userId, assetId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.attendanceModel.findOne({
      where: {
        user_id: userId,
        asset_id: assetId,
        status: 'checked_in',
        created_at: {
          [require('sequelize').Op.gte]: today,
          [require('sequelize').Op.lt]: tomorrow
        }
      },
      order: [['created_at', 'DESC']]
    });
  }

  async update(id, data, transaction = null) {
    const options = { where: { id } };
    if (transaction) options.transaction = transaction;
    
    return await this.attendanceModel.update(data, options);
  }

  async getUserAttendanceHistory(userId, limit = 10) {
    return await this.attendanceModel.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit
    });
  }

  async getAssetAttendanceHistory(assetId, limit = 10) {
    return await this.attendanceModel.findAll({
      where: { asset_id: assetId },
      order: [['created_at', 'DESC']],
      limit
    });
  }
}

module.exports = AttendanceRepository;