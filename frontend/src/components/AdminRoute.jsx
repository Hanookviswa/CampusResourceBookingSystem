import { Route, Redirect } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

const AdminRoute = ({ component: Component, ...rest }) => {
    return (
        <Route
            {...rest}
            render={(props) => {
                const token = localStorage.getItem('jwtToken');
                const role = getUserRole(token);

                if (!token) {
                    return <Redirect to="/login" />;
                }

                if (role !== 'admin') {
                    return <Redirect to="/resources" />;
                }

                return <Component {...props} />;
            }}
        />
    );
};

export default AdminRoute;