import { Game } from "./game/Game";
import { AuthGate } from "./game/AuthGate";

function App() {
  return (
    <AuthGate>
      <Game />
    </AuthGate>
  );
}

export default App;
