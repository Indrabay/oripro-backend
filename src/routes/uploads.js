const { Router } = require("express");
const { authMiddleware, ensureRole } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/uploader');

function InitUploadRouter() {
  const router = Router();

  router.use(authMiddleware, ensureRole, uploadMiddleware);

  router.post(
    '/:type',
    async (req, res) => {
      const url = []
      const host = req.protocol + '://' + req.get('host');
      req.files.forEach((file) => {
        const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/');
        const urlPath = `${host}/uploads${relativePath}`
        url.push(urlPath);
      })
      res.status(200).json({url: url})
    }
  )

  return router;
}

module.exports = { InitUploadRouter };