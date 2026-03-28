import { McpServer } from "skybridge/server";
import { z } from "zod";

const server = new McpServer(
  {
    name: "mito",
    version: "0.0.1",
  },
  { capabilities: {} },
).registerWidget(
  "placeholder",
  {
    description: "Placeholder widget — replace with real implementation.",
  },
  {
    description: "Renders the placeholder widget. Pass any input message.",
    inputSchema: {
      message: z.string().optional().describe("An optional message to display."),
    },
  },
  async ({ message }) => {
    return {
      structuredContent: { message: message ?? "Widget ready." },
      content: [{ type: "text", text: message ?? "Widget ready." }],
    };
  },
);

server.run();

export type AppType = typeof server;
