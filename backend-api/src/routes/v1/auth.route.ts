import express from "express";
import authController from "../../controllers/auth.controller";
import authValidations from "../../validations/authYup.validation"
import validateSchemaYup from "../../middleware/validateSchemaYup.middleware";

const router = express.Router();

router.post('/login', validateSchemaYup(authValidations.loginSchema), authController.login)
router.get('/profile', authController.getProfile)
router.post('/refresh-token', authController.refreshToken)


export default router