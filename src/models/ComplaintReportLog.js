const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class ComplaintReportLog extends Model {}

ComplaintReportLog.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  complaint_report_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: 'Reference to complaint_report'
  },
  old_status: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Previous status: 0=pending, 1=in_progress, 2=resolved, 3=closed'
  },
  new_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'New status: 0=pending, 1=in_progress, 2=resolved, 3=closed'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Notes about the status change'
  },
  photo_evidence_url: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'URL to photo evidence for the status change'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'User who made the status change'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'ComplaintReportLog',
  tableName: 'complaint_report_logs',
  timestamps: false,
  indexes: [
    { fields: ['complaint_report_id'] },
    { fields: ['created_at'] },
    { fields: ['created_by'] },
  ],
});

ComplaintReportLog.associate = (models) => {
  ComplaintReportLog.belongsTo(models.ComplaintReport, {
    foreignKey: 'complaint_report_id',
    as: 'complaintReport',
  });
  ComplaintReportLog.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'createdBy',
  });
};

module.exports = ComplaintReportLog;

