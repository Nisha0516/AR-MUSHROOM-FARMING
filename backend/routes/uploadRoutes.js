const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpg|jpeg|png|glb|usdz/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/octet-stream' || file.mimetype === 'model/gltf-binary' || file.mimetype === 'model/vnd.usdz+zip';

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images and 3D models only (jpg, jpeg, png, glb, usdz)!'));
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// @route   POST /api/upload
// @desc    Upload an image or 3D model file
// @access  Public
router.post('/', upload.single('file'), (req, res) => {
    if (req.file) {
        res.send({
            success: true,
            message: 'File Uploaded',
            filePath: `/uploads/${req.file.filename}`,
        });
    } else {
        res.status(400).send({
            success: false,
            message: 'No file uploaded',
        });
    }
});

module.exports = router;
