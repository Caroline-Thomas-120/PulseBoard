
const clients = new Set();

// Broadcast an event to every connected SSE client.
export const sendIssueEvent = (eventName, data) => {
  const message = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;

  console.log(`Broadcasting "${eventName}" to ${clients.size} client(s)`);

  for (const client of clients) {
    client.write(message);
  }
};

// Register a connected browser or test listener.
export const addIssueClient = (res) => {
  clients.add(res);
  console.log(`SSE client connected. Total clients: ${clients.size}`);

  res.on("close", () => {
    clients.delete(res);
    console.log(`SSE client disconnected. Total clients: ${clients.size}`);
  });
};

