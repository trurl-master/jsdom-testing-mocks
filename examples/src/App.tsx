import { Routes, Route } from 'react-router-dom';

import Nav from './components/Nav';

import GlobalObserver from './components/intersection-observer/global-observer/GlobalObserver';
import MeasureParent from './components/resize-observer/measure-parent/MeasureParent';
import PrintMySize from './components/resize-observer/print-my-size/PrintMySize';
import CustomUseMedia from './components/viewport/custom-use-media/CustomUseMedia';
import DeprecatedCustomUseMedia from './components/viewport/deprecated-use-media/DeprecatedUseMedia';
import { Layout } from './components/animations/Layout';
import AnimationsInView from './components/animations/examples/inview/InView';
import AnimationsAnimatePresence from './components/animations/examples/animate-presence/AnimatePresence';
import { ScrollTimelineExample } from './components/animations/examples/scroll-timeline/ScrollTimeline';
import { ViewTimelineExample } from './components/animations/examples/view-timeline/ViewTimeline';
import AnimationsIndex from './components/animations';

function Index() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>jsdom-testing-mocks Examples</h1>
      <p>
        This app demonstrates real-world behavior of browser APIs alongside their mocked equivalents.
        Use the navigation above to explore different examples.
      </p>
      
      <h2>Available Examples</h2>
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
          <h3>Intersection Observer</h3>
          <p>Demonstrates element visibility detection and scroll-based triggers.</p>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
          <h3>Resize Observer</h3>
          <p>Shows element size change detection with practical use cases.</p>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
          <h3>Viewport / Media Queries</h3>
          <p>Responsive design patterns and viewport-based behavior.</p>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
          <h3>Web Animations API</h3>
          <p>Advanced animation examples including scroll-driven animations.</p>
        </div>
      </div>
    </div>
  );
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
        <Route path="/animations" element={<Layout />}>
          <Route path="in-view" element={<AnimationsInView />} />
          <Route
            path="animate-presence"
            element={<AnimationsAnimatePresence />}
          />
          <Route path="scroll-timeline" element={<ScrollTimelineExample />} />
          <Route path="view-timeline" element={<ViewTimelineExample />} />
          <Route index element={<AnimationsIndex />} />
        </Route>
        <Route path="/" element={<Index />} />
      </Routes>
    </div>
  );
}

export default App;
