export interface Message {
  type: "error" | "info";
  /**
   * Defaults to `true`
   */
  dismissable?: boolean;
  text: string;
}

export interface MessageContainerProps {
  messages: Message[];
}

export function MessageContainer({ messages }: MessageContainerProps) {
  if (messages.length === 0) return null;

  return (
    <div class="message-container">
      {messages.map((message) => (
        <div
          class={`message message-${message.type}`}
          role="alert"
          data-type={message.type}
        >
          <span class="message-text">{message.text}</span>
          {(message.dismissable ?? true) && (
            <button type="button" class="message-dismiss" aria-label="Dismiss">
              &times;
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
