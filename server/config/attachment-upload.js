const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { Transform, pipeline } = require('stream');
const multer = require('multer');

const MAX_BYTES = 1 * 1024 * 1024 * 1024;

module.exports = function attachmentUpload(directory) {
  fs.ensureDirSync(directory);
  return multer({
    limits: { fileSize: MAX_BYTES + 1, files: 100, fields: 0 },
    storage: {
      _handleFile(req, file, callback) {
        const filename = crypto.randomUUID();
        const target = path.join(directory, filename);
        let size = 0;
        const counter = new Transform({ transform(chunk, encoding, done) {
          req.attachmentBytes = (req.attachmentBytes || 0) + chunk.length;
          size += chunk.length;
          if (req.attachmentBytes > MAX_BYTES) return done(Object.assign(new Error('1회 업로드 총 용량은 1GB까지 가능합니다.'), { status: 413 }));
          done(null, chunk);
        } });
        pipeline(file.stream, counter, fs.createWriteStream(target), error => {
          if (error) fs.remove(target).then(() => callback(error), callback);
          else callback(null, { filename, path: target, size });
        });
      },
      _removeFile(req, file, callback) { fs.remove(file.path).then(() => callback(null), callback); },
    },
  }).array('files', 100);
};
