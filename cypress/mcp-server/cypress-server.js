const { Server } = require("@modelcontextprotocol/sdk/server");

const { exec } = require("child_process");

const server = new Server(
  {
    name: "cypress-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.tool("run_cypress_test", "Execute Cypress tests", {}, async () => {
  return new Promise((resolve) => {
    exec("npx cypress run", (error, stdout) => {
      resolve({
        content: [
          {
            type: "text",
            text: stdout,
          },
        ],
      });
    });
  });
});

server.start();
