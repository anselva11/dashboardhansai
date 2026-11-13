import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  HANSAI SHIPPING LINE — Enterprise Backend API`);
  console.log(`  Listening on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

export default app;
