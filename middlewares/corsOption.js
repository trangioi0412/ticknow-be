const corsOptionsDelegate = (req, callback) => {
  const corsOptions = { origin: true };
  callback(null, corsOptions);
};

module.exports = corsOptionsDelegate;
