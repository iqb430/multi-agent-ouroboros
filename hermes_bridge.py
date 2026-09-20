import requests
import json
import os

class PixelAgentBridge:
    def __init__(self, session_id="hermes-agent-shifted", cwd=os.getcwd()):
        self.session_id = session_id
        self.cwd = cwd
        self.url = "http://127.0.0.1:3100/api/hooks/claude"
        self.headers = {"Content-Type": "application/json"}
        
        try:
            with open(os.path.expanduser("~/.pixel-agents/server.json")) as f:
                self.headers["Authorization"] = f"Bearer {json.load(f).get('token', '')}"
        except:
            print("[WARN] Pixel Agents server.json missing. Start pixel-agents first.")

    def emit(self, event_name, tool_name=None, tool_command=None):
        payload = {"session_id": self.session_id, "hook_event_name": event_name, "cwd": self.cwd}
        if tool_name:
            payload["tool_name"] = tool_name
        if tool_command:
            payload["tool_input"] = {"command": tool_command}
            
        try:
            requests.post(self.url, headers=self.headers, json=payload, timeout=2)
        except Exception:
            pass # Fail silently if server is down (anti-slop resilience)

# Usage Example:
# bridge = PixelAgentBridge()
# bridge.emit("SessionStart", source="startup")
# bridge.emit("PreToolUse", tool_name="Security Audit", tool_command="Scanning local ports...")
