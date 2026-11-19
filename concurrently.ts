import { concurrently } from "concurrently";

concurrently(
  [
    {
      command: "nodemon --config paraglide.nodemon.json",
      name: "paraglide",
      prefixColor: "blue",
    },
    {
      command: "nodemon",
      name: "bot",
      prefixColor: "cyan",
    },
    {
      command: "nodemon --config vitest.nodemon.json",
      name: "test",
      prefixColor: "magenta",
    },
  ],
  { killOthersOn: ["failure"] },
);
