import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const home = user.role === 'DRIVER' ? '/driver' : '/passenger';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <Link to={home} className="navbar__brand">
      <img src= {logo} className='logo-mark-img'/>
        Uber Barato :D
      </Link>
      <nav className="navbar__links">
        <Link to={home}>Dashboard</Link>
        <Link to="/history">Historial</Link>
      </nav>
      <div className="navbar__user">
        <span className="navbar__role-tag" data-role={user.role}>
          {user.role === 'DRIVER' ? 'Conductor' : 'Pasajero'}
        </span>
        <span className="navbar__name">{user.firstName}</span>
        <button className="btn btn--ghost btn--small" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </header>
  );
}
