
import { Route, Redirect } from 'react-router-dom';

const PublicRoute = ({ component: Component, render, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const token = localStorage.getItem('jwtToken');

        if (token) {
          return <Redirect to="/resources" />;
        }

        if (render) {
          return render(props);
        }

        return <Component {...props} />;
      }}
    />
  );
};

export default PublicRoute;
