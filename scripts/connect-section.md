## If the trendJack tools are missing

The trendJack tools come from the trendJack connector, for example `get_connection` and `list_signals`. Some apps load connector tools only when needed. Search your tools for "trendJack" before you decide they are missing. Other connectors can also have tools named `search` and `fetch`. Use the ones from trendJack.

If a trendJack tool call asks the user to connect, wait until they finish. Then make the same call again.

If the tools are still missing, trendJack is not connected yet. Say so in one sentence, then give the steps for the user's app:

- **Claude Code:** if you have a trendJack `authenticate` tool, call it and give the user the link it returns. Otherwise, ask the user to run `/mcp`, pick trendJack and choose **Authenticate**.
- **claude.ai and Claude Desktop:** ask the user to open **Customize > Plugins > trendJack > Connectors** and select **Connect** next to trendJack.

trendJack then asks the user to sign in or create an account, and to pick the workspace that Claude saves to. If the tools still do not appear after the user connects, ask them to start a new chat. Never tell the user to disconnect and connect again when trendJack was never connected.

When you talk to the user, call the workspace with `writable: true` the workspace they connected. Do not call it "writable".
