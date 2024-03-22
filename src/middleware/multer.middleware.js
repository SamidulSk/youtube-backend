import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './youtube_backend/public/temp')  //disk storeage
    },
    filename: function (req, file, cb) {

        cb(null, file.originalname)// user wallah num
    }
})

export const upload = multer({
    storage,
})
