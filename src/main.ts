import * as lambda from "./lambda";

(async () => {
  try {
    await lambda.execute();
  } catch (e) {
    // Deal with the fact the chain failed
  }
})();
