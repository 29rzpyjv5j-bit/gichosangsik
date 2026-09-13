import { Routes, Route } from 'react-router-dom';
import Home from './screens/Home';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
