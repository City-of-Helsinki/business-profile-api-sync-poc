import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.splat(),
    format.prettyPrint()
  ),
  transports: [new transports.Console({})]
});

export default logger;
