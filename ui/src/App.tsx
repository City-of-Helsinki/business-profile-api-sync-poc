import { Navigation } from "hds-react";
import Events from "./Events";

function App() {
  return (
    <div className="App">
      <Navigation
        title="Google Valvonta"
        menuToggleAriaLabel="menu"
        skipTo="#content"
        skipToContentLabel="Skip to content"
      ></Navigation>
      <main>
        <Events />
      </main>
    </div>
  );
}

export default App;
