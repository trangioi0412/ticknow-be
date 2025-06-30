const fs = require('fs');
const path = require('path');

const saveImageToDisk = (fileBuffer, fileName, folder) => {
  const dir = path.join(__dirname, `../public/images/${folder}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, fileBuffer);
  return `/images/${folder}/${fileName}`;
};

const deleteImageFromDisk = (imagePath, folderName) => {

  const fullPath = path.join(__dirname, `../public/images/${folderName}`, imagePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

};

module.exports = { saveImageToDisk ,deleteImageFromDisk};
