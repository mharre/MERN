const multer = require('multer');
const uuid = require('uuid');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const fileUpload = multer({
    limits: 500000,
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/images')
        },
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype]; // dynamically finds what extention we need, mimetype looks like 'image/png' but the extention we want is just 'png'
            cb(null, uuid.v1() + '.' + ext ); // generates random file name with the correct extention
        }
    }),
    fileFilter: (req, file, cb) => { //adding validation here because FE only validation is bad
        const isValid = !!MIME_TYPE_MAP[file.mimetype]; // double bang - converts value to either true / false, if it can't find one of 3 extentions it will be null therefore false because of the !!
        let error = isValid ? null : new Error('Invalid mimetype'); // if isValid = true then set error to null, if not - throw error
        cb(error, isValid);
    }
});

module.exports = fileUpload;