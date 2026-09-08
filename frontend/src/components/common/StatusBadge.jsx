import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  let badgeClass = 'badge-waiting';
  let label = normalized.replace(/_/g, ' ');

  switch (normalized) {
    case 'ACTIVE':
    case 'IN_PROGRESS':
    case 'OFFBOARDING_IN_PROGRESS':
      badgeClass = 'badge-active';
      break;
    case 'COMPLETED':
    case 'APPROVED':
    case 'RELIEVED':
      badgeClass = 'badge-approved';
      break;
    case 'WAITING':
    case 'INITIATED':
    case 'OFFBOARDING_INITIATED':
      badgeClass = 'badge-waiting';
      break;
    case 'REJECTED':
    case 'CANCELLED':
    case 'TERMINATED':
      badgeClass = 'badge-rejected';
      break;
    default:
      badgeClass = 'badge-waiting';
  }

  return <span className={`badge ${badgeClass}`}>{label}</span>;
};
