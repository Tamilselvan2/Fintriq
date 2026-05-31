import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app';
import logger from './utils/logger';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
