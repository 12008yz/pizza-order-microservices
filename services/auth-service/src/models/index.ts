import { User } from './User';
import { RefreshToken } from './RefreshToken';
import { UserSession } from './UserSession';
import { VerificationCode } from './VerificationCode';

// Определяем ассоциации
// User -> RefreshToken (один ко многим)
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });

// User -> UserSession (один ко многим)
UserSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(UserSession, { foreignKey: 'userId', as: 'sessions' });

// User -> VerificationCode (один ко многим)
VerificationCode.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(VerificationCode, { foreignKey: 'userId', as: 'verificationCodes' });

export { User, RefreshToken, UserSession, VerificationCode };
