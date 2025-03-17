export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
      uri: process.env.MONGO_URI || 'mongodb://localhost/lms',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'secretKey',
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    },
  });