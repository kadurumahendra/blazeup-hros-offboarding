import React from 'react';
import { Check, Clock, AlertTriangle, Play, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const StageTimeline = ({ stages = [], activeStageId = null, onSelectStage = null }) => {
  if (!stages || stages.length === 0) return null;

  const getNodeIcon = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return <Check size={18} strokeWidth={3} />;
      case 'ACTIVE':
        return <Play size={16} fill="currentColor" />;
      case 'REJECTED':
        return <XCircle size={18} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'completed';
      case 'ACTIVE':
        return 'active';
      case 'REJECTED':
        return 'rejected';
      default:
        return 'waiting';
    }
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="timeline-stepper">
        <div className="timeline-line" />
        {stages.map((stage, idx) => {
          const statusClass = getStatusClass(stage.status);
          const isSelected = activeStageId === stage.stageId;

          return (
            <div
              key={stage.stageId || idx}
              className={`timeline-step ${statusClass}`}
              onClick={() => onSelectStage && onSelectStage(stage)}
              style={{ cursor: onSelectStage ? 'pointer' : 'default' }}
            >
              <div
                className="timeline-node"
                style={{
                  transform: isSelected ? 'scale(1.15)' : 'none',
                  outline: isSelected ? '3px solid var(--primary)' : 'none'
                }}
              >
                {getNodeIcon(stage.status)}
              </div>
              <div className="timeline-label">
                {stage.stageName || stage.name}
              </div>
              <div className="timeline-sublabel">
                <span style={{ fontWeight: 600 }}>{stage.role?.replace('_', ' ')}</span>
                <span style={{ margin: '0 4px' }}>•</span>
                <span>{stage.executionType || 'SEQUENTIAL'}</span>
              </div>
              {stage.status === 'APPROVED' && stage.approvedByName && (
                <div style={{ fontSize: '10px', color: 'var(--success-text)', marginTop: '2px', fontWeight: 600 }}>
                  ✓ {stage.approvedByName}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
