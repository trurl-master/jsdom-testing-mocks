import { mockDocumentTimeline } from '../DocumentTimeline';
import { cssNumberishToNumber } from '../cssNumberishHelpers';

mockDocumentTimeline();
runner.useFakeTimers();

describe('DocumentTimeline', () => {
  it('should be defined', () => {
    expect(DocumentTimeline).toBeDefined();
  });

  it('should add a default timeline to the document', () => {
    expect(document.timeline).toBeInstanceOf(DocumentTimeline);

    // check that currentTime is non negative number
    expect(document.timeline.currentTime).toBeGreaterThanOrEqual(0);
  });

  it('should set default origin time to 0', () => {
    const timeline = new DocumentTimeline();

    const timelineCurrentTime = cssNumberishToNumber(timeline.currentTime) ?? 0;
    const documentCurrentTime = cssNumberishToNumber(document.timeline.currentTime) ?? 0;

    expect(timelineCurrentTime / 10).toBeCloseTo(
      documentCurrentTime / 10,
      1
    );
  });

  it('should set origin time to the given value', () => {
    const timeline = new DocumentTimeline({ originTime: 100 });

    const timelineCurrentTime = cssNumberishToNumber(timeline.currentTime) ?? 0;
    const documentCurrentTime = cssNumberishToNumber(document.timeline.currentTime) ?? 0;

    expect(timelineCurrentTime).toBeCloseTo(
      documentCurrentTime - 100,
      0
    );
  });
});
