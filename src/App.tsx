import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="screen">기초상식</div>} />
    </Routes>
  );
}
