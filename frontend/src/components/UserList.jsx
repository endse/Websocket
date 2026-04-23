export default function UserList({ users, allUsers, currentUser }) {
  if (!users || users.length === 0) {
    return <div className="user-list-empty">No users online</div>;
  }

  return (
    <ul className="user-list">
      {users.map((username, idx) => (
        <li key={idx} className={`user-list-item ${username === currentUser ? 'is-you' : ''}`}>
          <div className="user-list-avatar">
            {String(username).charAt(0).toUpperCase()}
            <span className="online-dot" />
          </div>
          <span className="user-list-name">
            {username}
            {username === currentUser && <span className="you-badge">you</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
