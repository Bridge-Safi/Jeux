import { Router, type IRouter } from "express";
import healthRouter from "./health";
import diamondsRouter from "./diamonds";

const router: IRouter = Router();

router.use(healthRouter);
router.use(diamondsRouter);

export default router;
