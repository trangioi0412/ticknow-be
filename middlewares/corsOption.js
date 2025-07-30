const allowedOrigins = [
  'http://localhost:3000',
  'https://ticknow.xyz'
];

const corsOptionsDelegate = (req, callback) => {
  const origin = req.header('Origin');
  if (allowedOrigins.includes(origin)) {
    callback(null, {
      origin: true,
      credentials: true
    });
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

module.exports = corsOptionsDelegate;
module.exports.allowedOrigins = allowedOrigins;
