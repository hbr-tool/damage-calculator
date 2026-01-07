import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import DmgCalcPage from './pages/DmgCalcPage';
import SpodSimPage from './pages/SpodSimPage';
import StyleCheckerPage from './pages/StyleCheckerPage';
import ArtsListPage from './pages/ArtsListPage';
import CharaMgmtPage from './pages/CharaMgmtPage';
import PrivacyPage from './pages/PrivacyPage';

import 'assets/styles/header.css';
import 'assets/styles/common.css';
import 'assets/styles/micromodal.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/damage" element={<DmgCalcPage />} />
        <Route path="/simulator" element={<SpodSimPage />} />
        <Route path="/checker" element={<StyleCheckerPage />} />
        <Route path="/artslist" element={<ArtsListPage />} />
        <Route path="/management" element={<CharaMgmtPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
