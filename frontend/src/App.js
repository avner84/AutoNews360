import {RouterProvider} from "react-router-dom";
import {UserProvider} from "./store/UserContext";
import router from './routes/router'

function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}

export default App;
