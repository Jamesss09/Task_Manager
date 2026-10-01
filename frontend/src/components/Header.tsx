import { useAuth } from '../context/AuthContext';
import './Header.css';

/** Shows who is signed in and offers a way out. */
export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header__identity">
        <h1 className="header__title">Task Manager</h1>
        <p className="header__subtitle">
          Create, edit, complete and delete your tasks.
        </p>
      </div>

      {user ? (
        <div className="header__user">
          <span className="header__email" title={user.email}>
            {user.email}
          </span>
          <button className="button button--ghost" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      ) : null}
    </header>
  );
}