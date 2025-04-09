// src/App.jsx
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { TripProvider } from "./context/TripContext";
import { ChatProvider } from "./context/ChatContext";

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <ChatProvider>
          <RouterProvider router={router} />
        </ChatProvider>
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
