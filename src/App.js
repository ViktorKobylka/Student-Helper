//import logo from './logo.svg';
//import './App.css';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LandingPage from './components/landingPage';
import MainPage from './components/mainPage';


function App() {
  return (
    <Router>    
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/mainPage" element={<MainPage />} />
    </Routes>
  </Router>
  );
}

export default App;
