import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";
import { registerCustomer } from "../controllers/customer.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/register").post(registerCustomer)

router.route("/login").post(loginUser)

//user crud operations 
router.route("/upload").post(upload.single('file'), (req, res) => {
    res.status(200).send("File uploaded successfully");
});


export default router 
