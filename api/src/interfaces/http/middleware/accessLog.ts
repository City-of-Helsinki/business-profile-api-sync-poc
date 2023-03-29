import { NextFunction, Request, Response } from 'express';
import logger from '../../../infra/logger';

const accessLog = (req: Request, res: Response, next: NextFunction) => {
  const { httpVersion, method, url } = req;
  logger.info({ httpVersion, method, url });
  next();
};

export default accessLog;
