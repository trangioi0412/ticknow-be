const mongoose = require("mongoose");

const convertGenreIds = (genreArray) => {
  return genreArray.map(id => ({ id: new mongoose.Types.ObjectId(id) }));
};

module.exports =  convertGenreIds 
