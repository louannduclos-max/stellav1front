// Louann V1 — Main app entry + routing

const { Landing, WizardShell, Generation } = window;

function App() {
  const route = LouannStore.useRoute();

  return (
    <LouannStore.WizardProvider>
      <RouterView route={route} />
    </LouannStore.WizardProvider>
  );
}

function RouterView({ route }) {
  switch (route.name) {
    case 'landing':
      return <Landing />;
    case 'wizard':
      return <WizardShell step={route.step} />;
    case 'generation':
    case 'result':
    case 'example':
      return <Generation />;
    default:
      return <Landing />;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
