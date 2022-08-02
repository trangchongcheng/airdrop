import { config } from "dotenv";
import AirdropLandRevo from "./land";
const runners = {
  AirdropLandRevo,
};

(async () => {
  config();
  const name = process.argv[2];
  const runner = runners[name];
  runner()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
})();
