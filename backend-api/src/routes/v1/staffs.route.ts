import express from "express";
import staffsController from "../../controllers/staffs.controller";
import validateSchema from "../../middleware/validateSchema.middleware";
import staffsValidation from "../../validations/staffs.validation";


const router = express.Router();

router.get('', staffsController.allStaffs);
router.get('/:id', staffsController.findStafftById)
router.post('', validateSchema(staffsValidation.createRecord), staffsController.createStaffRecord)
router.put('/:id', validateSchema(staffsValidation.updateRecord), staffsController.updateStaffById)
router.delete('/:id', staffsController.deleteStaffbyId)

export default router