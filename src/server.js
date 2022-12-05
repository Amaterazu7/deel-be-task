const app = require('./app');

async function init() {
  try {
    const PORT = 3001;
    app.listen(PORT, () => console.log(`::: Express App Listening on Port >> :${PORT} << :::`));
  } catch (error) {
    console.error(` - An error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}

(async () => init())();
