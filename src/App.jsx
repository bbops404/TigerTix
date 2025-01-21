import Header from './components/Header';
import EventSection from './components/EventSection';
import Carousel from './components/Carousel';
function App() {
  return (
    <div className="App">
      <Header />
      <Carousel />
      <EventSection title="Ticketed Events" />
      <EventSection title="Free Events" />
      <EventSection title="Events Coming Soon" />
      
    </div>
  );
}
export default App;