const { sequelize, DataTypes } = require('./country'); // Adjust to your centralized DB config

const User = sequelize.define('User', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  email: { 
    type: DataTypes.STRING(100), 
    unique: true, 
    allowNull: false, // Required for forgot password
    validate: { isEmail: true }
  },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
  otp_code: { type: DataTypes.STRING(6), allowNull: true }, // 6-digit OTP
  otp_expires_at: { type: DataTypes.DATE, allowNull: true } // OTP expiration
}, {
  timestamps: true, // For createdAt/updatedAt
  indexes: [
    { fields: ['email'] }, // Optimize email lookups
    { fields: ['otp_code'] } // Optimize OTP verification
  ]
});

module.exports = { User };