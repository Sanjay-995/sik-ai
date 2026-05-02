import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scanRouter from "./scan";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/scan", scanRouter);

export default router;
