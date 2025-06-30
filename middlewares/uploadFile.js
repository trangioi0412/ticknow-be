const multer = require('multer');
const path = require('path');

const checkFileType = (req, file, cb) => {
  const filetypes = /\.(jpg|jpeg|png|gif|webp)$/;
  if (!file.originalname.match(filetypes)) {
    return cb(new Error('Bạn chỉ được upload file ảnh'));
  }
  cb(null, true);
};

const storage = multer.memoryStorage();

const getUploader = () => {
  return multer({
    storage: storage,
    fileFilter: checkFileType,
  });
};

module.exports = getUploader;