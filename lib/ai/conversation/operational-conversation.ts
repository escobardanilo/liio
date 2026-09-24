export type OperationalConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type UiConversationMessage = OperationalConversationMessage & { id?: string };

export function buildOperationalConversation(messages: UiConversationMessage[]): OperationalConversationMessage[] {
  return messages
    .filter((message) => message.id !== "welcome")
    .map(({ role, content }) => ({ role, content: content.trim() }))
    .filter((message) => message.content.length > 0)
    .slice(-30);
}
