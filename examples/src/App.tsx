import { Routes, Route } from 'react-router-dom';

import Nav from './components/Nav';

import GlobalObserver from './components/intersection-observer/global-observer/GlobalObserver';
import MeasureParent from './components/resize-observer/measure-parent/MeasureParent';
import PrintMySize from './components/resize-observer/print-my-size/PrintMySize';
import CustomUseMedia from './components/viewport/custom-use-media/CustomUseMedia';
import DeprecatedCustomUseMedia from './components/viewport/deprecated-use-media/DeprecatedUseMedia';

function Index() {
  return <></>;
}

function App() {
  return (
    <div>
      <Nav />
      <Routes>
        <Route path="/intersection-observer" element={<GlobalObserver />} />
        <Route path="/viewport" element={<CustomUseMedia />}></Route>
        <Route
          path="/viewport-deprecated"
          element={<DeprecatedCustomUseMedia />}
        />
        <Route path="/resize-observer/do-i-fit" element={<MeasureParent />} />
        <Route
          path="/resize-observer/print-my-size"
          element={<PrintMySize />}
        />
        <Route path="/" element={<Index />} />
      </Routes>
    </div>
  );
}

export default App;
