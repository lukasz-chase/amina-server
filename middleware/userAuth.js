import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedData = jwt.verify(token, process.env.SECRET);
    req.userId = decodedData?.id;
    next();
  } catch (error) {
    console.log(error);
  }
};

export default userAuth;
