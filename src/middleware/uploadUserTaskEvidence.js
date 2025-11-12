const multer = require("multer");
const fs = require("fs");
const path = require("path");

function uploadUserTaskEvidenceMiddleware() {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join("public/uploads", "user-task-evidence");
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const tempOriginal = file.originalname.split('.');
      const ext = tempOriginal[tempOriginal.length - 1];
      cb(null, Date.now() + '_' + Math.random().toString(36).substring(7) + '.' + ext);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  });

  return upload.fields([
    { name: 'file_before', maxCount: 1 },
    { name: 'file_after', maxCount: 1 },
    { name: 'file_scan', maxCount: 1 },
  ]);
}

module.exports = uploadUserTaskEvidenceMiddleware;

