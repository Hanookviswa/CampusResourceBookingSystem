
import { useHistory } from 'react-router-dom';

const LogoutButton = ({ setIsLoggedIn }) => {
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');

    setIsLoggedIn(false);

    history.push('/login');
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;
