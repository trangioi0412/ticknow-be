const allowedOrigins = [
  'http://localhost:3000',
  'https://ticknow.xyz',
  'https://www.ticknow.xyz'
];

const corsOptionsDelegate = (req, callback) => {
  const origin = req.header('Origin');
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, {
      origin: true,
      credentials: true
    });
  } else {
    console.error('Blocked by CORS:', origin);
    callback(new Error('Not allowed by CORS'));
  }
};

module.exports = corsOptionsDelegate;
module.exports.allowedOrigins = allowedOrigins;
