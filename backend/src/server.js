const app = require('./app');
const { port, nodeEnv } = require('./config/env');
const { startScheduler } = require('./scheduler/cron');

const start = async () => {
  try {
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port} in ${nodeEnv} mode`);
      
      // Start the cron scheduler
      if (nodeEnv !== 'test') {
        startScheduler();
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
