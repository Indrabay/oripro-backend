const multer = require("multer");
const fs = require("fs");
const path = require("path");

function uploadMiddleware(req, res, next) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join("public/uploads", req.path);
      console.log(uploadPath)
      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const tempOriginal = file.originalname.split('.')
      cb(null, Date.now() + '.' +tempOriginal[tempOriginal.length-1]);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  });

  const uploadHandler = upload.array("files", 10);

  uploadHandler(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .json({ error: "One or more files exceed the 5MB size limit" });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    next();
  });
}

module.exports = uploadMiddleware;
