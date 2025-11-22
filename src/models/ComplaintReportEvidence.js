const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class ComplaintReportEvidence extends Model {}

ComplaintReportEvidence.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  complaint_report_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'ComplaintReportEvidence',
  tableName: 'complaint_report_evidences',
  timestamps: false,
  indexes: [
    { fields: ['complaint_report_id'] },
    { fields: ['created_at'] },
  ],
});

ComplaintReportEvidence.associate = (models) => {
  ComplaintReportEvidence.belongsTo(models.ComplaintReport, {
    foreignKey: 'complaint_report_id',
    as: 'complaintReport',
  });
};

module.exports = ComplaintReportEvidence;

