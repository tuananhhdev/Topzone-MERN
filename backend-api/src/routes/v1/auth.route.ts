import express from "express";
import authController from "../../controllers/auth.controller";
import validateSchemaYup from "../../middleware/validateSchemaYup.middleware";
import authValidations from "../../validations/authYup.validation"
import { authenticateToken } from "../../middleware/auth.middleware";

const router = express.Router();

router.post('/login', validateSchemaYup(authValidations.loginSchema), authController.login)
router.get('/profile',authenticateToken, authController.getProfile)
router.post('/refresh-token', authenticateToken, authController.refreshToken)


export default router