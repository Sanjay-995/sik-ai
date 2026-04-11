import { Router, type IRouter } from "express";
import healthRouter from "./health";
import coachRouter from "./coach";
import scansRouter from "./scans";

const router: IRouter = Router();

router.use(healthRouter);
router.use(coachRouter);
router.use(scansRouter);

export default router;
