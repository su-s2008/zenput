import { Spinner, Skeleton, SkeletonText, SkeletonAvatar, ProgressBar, CircularProgress } from 'zenput';
import { Section, Scenario } from './_shell';

export function FeedbackSection() {
  return (
    <Section
      id="feedback"
      name="Feedback"
      description="Loading and feedback primitives — Spinner, Skeleton, ProgressBar, CircularProgress."
    >
      <Scenario title="Spinner — sizes">
        <div className="row" style={{ alignItems: 'center' }}>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="xl" />
        </div>
      </Scenario>

      <Scenario title="Skeleton — shapes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px' }}>
          <Skeleton width="100%" height={16} />
          <Skeleton width="80%" height={16} />
          <Skeleton width="60%" height={16} />
          <div className="row" style={{ alignItems: 'center', gap: '12px' }}>
            <Skeleton variant="circle" width={40} height={40} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Skeleton width="70%" height={14} />
              <Skeleton width="50%" height={12} />
            </div>
          </div>
        </div>
      </Scenario>

      <Scenario title="SkeletonText & SkeletonAvatar">
        <div className="row" style={{ alignItems: 'center', gap: '12px' }}>
          <SkeletonAvatar size={40} />
          <SkeletonText lines={3} />
        </div>
      </Scenario>

      <Scenario title="Skeleton — reveals content when loading=false">
        <Skeleton loading={false} width={120} height={36}>
          <button type="button">Loaded content</button>
        </Skeleton>
      </Scenario>

      <Scenario title="ProgressBar — determinate">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
          <ProgressBar value={25} label="Upload" showValue />
          <ProgressBar value={60} status="success" label="Build" showValue />
          <ProgressBar value={75} status="warning" label="Storage" showValue />
          <ProgressBar value={90} status="error" label="Memory" showValue />
        </div>
      </Scenario>

      <Scenario title="ProgressBar — indeterminate & striped">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
          <ProgressBar indeterminate label="Loading…" />
          <ProgressBar value={55} striped label="Installing" showValue />
        </div>
      </Scenario>

      <Scenario title="CircularProgress — sizes">
        <div className="row" style={{ alignItems: 'center' }}>
          <CircularProgress value={25} size="sm" showValue />
          <CircularProgress value={50} size="md" showValue />
          <CircularProgress value={75} size="lg" showValue />
        </div>
      </Scenario>

      <Scenario title="CircularProgress — statuses">
        <div className="row" style={{ alignItems: 'center' }}>
          <CircularProgress value={40} status="default" showValue />
          <CircularProgress value={100} status="success" showValue />
          <CircularProgress value={60} status="warning" showValue />
          <CircularProgress value={30} status="error" showValue />
        </div>
      </Scenario>
    </Section>
  );
}
