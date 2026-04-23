export default function MessageBubble({ message, isOwn, isSystem }) {
  if (isSystem) {
    return (
      <div className="message-system">
        <span>{message.content}</span>
      </div>
    );
  }

  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && (
        <div className="message-avatar">
          {message.senderName?.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="message-content">
        {!isOwn && <span className="message-sender">{message.senderName}</span>}
        <div className="message-text">{message.content}</div>
        <span className="message-time">{time}</span>
      </div>
    </div>
  );
}
