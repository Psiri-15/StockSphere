import jwt from 'jsonwebtoken';

export const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'stocksphere_default_dev_secret_key',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};
