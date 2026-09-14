import { Routes, Route, useLocation } from 'react-router-dom';
import { TabBar } from './components/TabBar';
import { GradientDefs } from './components/Icons';
import Home from './screens/Home';
import Categories from './screens/Categories';
import CategoryDetail from './screens/CategoryDetail';
import Quiz from './screens/Quiz';
import Result from './screens/Result';
import WrongNotes from './screens/WrongNotes';
import Badges from './screens/Badges';
import Shop from './screens/Shop';
import Profile from './screens/Profile';

export default function App() {
  const { pathname } = useLocation();
  const showTabs = pathname !== '/quiz' && pathname !== '/result';
  return (
    <>
    <GradientDefs />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/category/:categoryId" element={<CategoryDetail />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/result" element={<Result />} />
      <Route path="/wrong-notes" element={<WrongNotes />} />
      <Route path="/badges" element={<Badges />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
    {showTabs && <TabBar />}
    </>
  );
}
