export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    uri: process.env.DATABASE_URI || 'mongodb://localhost/lms',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'lms-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:4200',
  },
});