const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class PasswordResetToken extends Model {}

PasswordResetToken.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  token_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  used_at: DataTypes.DATE,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'PasswordResetToken',
  tableName: 'password_reset_tokens',
  timestamps: false,
});

module.exports = PasswordResetToken;
