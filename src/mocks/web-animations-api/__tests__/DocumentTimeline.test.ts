import { mockDocumentTimeline } from '../DocumentTimeline';

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

    expect((timeline.currentTime ?? 0) / 10).toBeCloseTo(
      (document.timeline.currentTime ?? 0) / 10,
      1
    );
  });

  it('should set origin time to the given value', () => {
    const timeline = new DocumentTimeline({ originTime: 100 });

    expect(timeline.currentTime ?? 0).toBeCloseTo(
      (document.timeline.currentTime ?? 0) - 100,
      0
    );
  });
});
