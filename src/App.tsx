import { Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import Categories from './screens/Categories';
import CategoryDetail from './screens/CategoryDetail';
import Quiz from './screens/Quiz';
import Result from './screens/Result';
import WrongNotes from './screens/WrongNotes';
import Badges from './screens/Badges';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/category/:categoryId" element={<CategoryDetail />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/result" element={<Result />} />
      <Route path="/wrong-notes" element={<WrongNotes />} />
      <Route path="/badges" element={<Badges />} />
    </Routes>
  );
}
