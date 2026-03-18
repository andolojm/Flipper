import './SplashScreen.css';

export default function SplashScreen() {
  return (
    <div className="splash">
      <h1 className="splash-title">Flipperino</h1>
      <div className="splash-spinner" aria-label="Loading" />
    </div>
  );
}
