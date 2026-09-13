import { Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import Categories from './screens/Categories';
import CategoryDetail from './screens/CategoryDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/category/:categoryId" element={<CategoryDetail />} />
    </Routes>
  );
}
