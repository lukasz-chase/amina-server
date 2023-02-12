import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import util from "util";

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const id = uuidv4();
    cb(null, `${id}-${file.originalname}-${file.fieldname}`);
  },
});
const upload = multer({ storage: storage });
export const unlinkFile = util.promisify(fs.unlink);
export default () => upload.any();
