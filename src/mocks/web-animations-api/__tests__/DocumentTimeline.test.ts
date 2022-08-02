import { mockDocumentTimeline } from '../DocumentTimeline';

mockDocumentTimeline();
jest.useFakeTimers();

describe('DocumentTimeline', () => {
  it('should be defined', () => {
    expect(DocumentTimeline).toBeDefined();
  });

  it('should add a default timeline to the document', () => {
    expect(document.timeline).toBeInstanceOf(DocumentTimeline);
    expect(document.timeline.currentTime).toBe(0);
  });

  it('should set default origin time to 0', () => {
    const timeline = new DocumentTimeline();

    expect(timeline.currentTime).toBe(document.timeline.currentTime);
  });

  it('should set origin time to the given value', () => {
    const timeline = new DocumentTimeline({ originTime: 100 });

    expect(timeline.currentTime).toBe(
      (document.timeline.currentTime ?? 0) - 100
    );
  });
});
