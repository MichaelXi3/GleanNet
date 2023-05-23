// A convenient way of using AuthContext 
import { useContext } from "react";
import AuthContext from './AuthProvider';

const useAuth = () => {
    return useContext(AuthContext);
}

export default useAuth;