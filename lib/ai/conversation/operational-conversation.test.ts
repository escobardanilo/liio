import assert from "node:assert/strict";
import test from "node:test";
import { buildOperationalConversation } from "./operational-conversation";

test("synthetic welcome and blank content are never submitted", () => {
  assert.deepEqual(buildOperationalConversation([
    { id: "welcome", role: "assistant", content: "" },
    { id: "blank", role: "assistant", content: "   " },
    { id: "real", role: "user", content: "  What does SON do?  " },
  ]), [{ role: "user", content: "What does SON do?" }]);
});

test("first message is valid and second-turn history is preserved", () => {
  const conversation = buildOperationalConversation([
    { id: "welcome", role: "assistant", content: "" },
    { id: "u1", role: "user", content: "Line 3 stopped." },
    { id: "a1", role: "assistant", content: "Read the visible alarm code without operating the line." },
    { id: "u2", role: "user", content: "It shows E42." },
  ]);
  assert.equal(conversation.length, 3);
  assert.equal(conversation[0].role, "user");
  assert.equal(conversation.at(-1)?.content, "It shows E42.");
});
