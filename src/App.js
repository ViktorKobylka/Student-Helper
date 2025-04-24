//import logo from './logo.svg';
//import './App.css';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LandingPage from './components/landingPage';
import MainPage from './components/mainPage';
import SavedResponsesPage from './components/savedResponsesPage';
import EssayPage from './components/essayPage';
import EssayResultPage from './components/essayResultPage';

function App() {
  return (
    <Router>    
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/mainPage" element={<MainPage />} />
      <Route path="/saved" element={<SavedResponsesPage />} />
      <Route path="/essay" element={<EssayPage />} />
      <Route path="/essayResult" element={<EssayResultPage />} />
    </Routes>
  </Router>
  );
}

export default App;
