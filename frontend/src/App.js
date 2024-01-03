import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { Navigate } from "react-router-dom";

import { UserProvider } from "./store/UserContext";

// pages
import NotFound from "./pages/NotFound";
import HomeStandardNews, {
  newsLoader,
} from "./pages/standardNews/HomeStandardNews";
import HomeAvatarNews, {
  avatarNewsLoader,
} from "./pages/avatarNews/HomeAvatarNews";
import About from "./pages/About";
import NewsArticle, { articleLoader } from "./pages/standardNews/NewsArticle";
import AvatarNewsVideo, {
  avatarNewsVideoLoader,
} from "./pages/avatarNews/AvatarNewsVideo";
import Login, { loginAction } from "./pages/auth/Login";
import SignUp, { signUpAction } from "./pages/auth/SignUp";
import EditUser, { editUserAction } from "./pages/user/EditUser";
import ChangePassword, {
  changePasswordAction,
} from "./pages/user/ChangePassword";
import DeleteUser from "./pages/user/DeleteUser";
import VerificationResults from "./pages/auth/VerificationResults";

// layouts
import RootLayout from "./layouts/RootLayout";
import NewsLayout from "./layouts/NewsLayout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Navigate to="/news" replace />} />
      <Route path="news" element={<NewsLayout />}>
        <Route index element={<HomeStandardNews />} loader={newsLoader} />
        <Route path=":id" element={<NewsArticle />} loader={articleLoader} />
      </Route>
      <Route path="avatars" element={<NewsLayout />}>
        <Route index element={<HomeAvatarNews />} loader={avatarNewsLoader} />
        <Route
          path=":id"
          element={<AvatarNewsVideo />}
          loader={avatarNewsVideoLoader}
        />
      </Route>
      <Route path="about" element={<NewsLayout />}>
        <Route index element={<About />} />
      </Route>
      <Route path="login" element={<Login />} action={loginAction} />
      <Route path="signup" element={<SignUp />} action={signUpAction} />
      <Route path="verification-results" element={<VerificationResults />} />
      <Route path="user">
        <Route path="edit" element={<EditUser />} action={editUserAction} />
        <Route
          path="change-password"
          element={<ChangePassword />}
          action={changePasswordAction}
        />
        <Route path="delete-account" element={<DeleteUser />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}

export default App;
