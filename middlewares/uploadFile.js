const multer = require('multer');
const path = require('path');
const fs = require('fs');

const checkFileType = (req, file, cb) => {
  const filetypes = /\.(jpg|jpeg|png|gif|webp)$/;
  if (!file.originalname.match(filetypes)) {
    return cb(new Error('Bạn chỉ được upload file ảnh'));
  }
  cb(null, true);
};

const getUploader = () => {

  const storage = multer.diskStorage({
    destination: function(req,file, cb){

      let folder = 'public/images/orthers';

      if(file.fieldname === 'image'){
        folder = 'public/images/movie';
      }

      if(file.fieldname === 'banner'){
        folder = 'public/images/banner';
      }

      if(!fs.existsSync(folder)){
        fs.mkdirSync( folder, { recursive: true } )
      }

      cb( null, folder );
    },

    filename: function ( req, file, cb ){
      const uniqueName = Date.now() + '-' + file.originalname;
      cb ( null, uniqueName )
    }
  });

  return multer({
    storage: storage,
    fileFilter: checkFileType,
  })

};

module.exports = getUploader;
