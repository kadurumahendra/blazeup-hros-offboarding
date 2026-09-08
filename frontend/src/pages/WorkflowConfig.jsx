import React, { useState, useEffect } from 'react';
import { workflowService } from '../services/workflowService';
import { useAuth, ROLES } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StageTimeline } from '../components/workflow/StageTimeline';
import { Modal } from '../components/common/Modal';
import {
  GitFork,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Clock,
  Shield,
  Layers,
  HelpCircle,
  Copy
} from 'lucide-react';

export const WorkflowConfig = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Template editor state
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [stages, setStages] = useState([]);

  // Stage Edit / Add Modal
  const [showStageModal, setShowStageModal] = useState(false);
  const [editingStageIndex, setEditingStageIndex] = useState(null);
  const [stageForm, setStageForm] = useState({
    stageId: '',
    name: '',
    role: 'MANAGER',
    order: 1,
    executionType: 'PARALLEL',
    dependsOn: [],
    deadlineHours: 48,
    reminderAfterHours: 24,
    checklist: []
  });

  const [newChecklistLabel, setNewChecklistLabel] = useState('');

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await workflowService.getTemplates({ processType: 'OFFBOARDING' });
      if (res.data && res.data.length > 0) {
        setTemplates(res.data);
        const active = res.data.find((t) => t.isActive) || res.data[0];
        loadTemplateIntoEditor(active);
      }
    } catch (err) {
      toast.error('Failed to load workflow templates: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateIntoEditor = (tpl) => {
    setActiveTemplate(tpl);
    setTemplateName(tpl.name);
    setTemplateDescription(tpl.description || '');
    setStages(JSON.parse(JSON.stringify(tpl.stages || [])));
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenAddStage = () => {
    setEditingStageIndex(null);
    setStageForm({
      stageId: `stage_${Math.random().toString(36).substring(2, 7)}`,
      name: '',
      role: 'MANAGER',
      order: stages.length + 1,
      executionType: 'PARALLEL',
      dependsOn: [],
      deadlineHours: 48,
      reminderAfterHours: 24,
      checklist: []
    });
    setNewChecklistLabel('');
    setShowStageModal(true);
  };

  const handleOpenEditStage = (index) => {
    setEditingStageIndex(index);
    setStageForm(JSON.parse(JSON.stringify(stages[index])));
    setNewChecklistLabel('');
    setShowStageModal(true);
  };

  const handleSaveStageModal = (e) => {
    e.preventDefault();
    if (!stageForm.name) {
      toast.warning('Stage name is required');
      return;
    }

    const updated = [...stages];
    if (editingStageIndex !== null) {
      updated[editingStageIndex] = stageForm;
    } else {
      updated.push(stageForm);
    }

    // Re-index orders
    updated.forEach((s, idx) => (s.order = idx + 1));
    setStages(updated);
    setShowStageModal(false);
  };

  const handleDeleteStage = (index) => {
    const deletedStageId = stages[index].stageId;
    const updated = stages
      .filter((_, idx) => idx !== index)
      .map((s, idx) => ({
        ...s,
        order: idx + 1,
        // Remove deleted stage from dependsOn arrays
        dependsOn: (s.dependsOn || []).filter((id) => id !== deletedStageId)
      }));
    setStages(updated);
  };

  const handleMoveStage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= stages.length) return;
    const updated = [...stages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updated.forEach((s, idx) => (s.order = idx + 1));
    setStages(updated);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistLabel.trim()) return;
    const newItem = {
      itemId: `chk_${Math.random().toString(36).substring(2, 7)}`,
      label: newChecklistLabel.trim(),
      isRequired: true,
      category: 'General'
    };
    setStageForm({
      ...stageForm,
      checklist: [...(stageForm.checklist || []), newItem]
    });
    setNewChecklistLabel('');
  };

  const handleRemoveChecklistItem = (itemIndex) => {
    setStageForm({
      ...stageForm,
      checklist: stageForm.checklist.filter((_, idx) => idx !== itemIndex)
    });
  };

  const handleSaveWorkflow = async () => {
    if (!templateName.trim()) {
      toast.warning('Template name is required');
      return;
    }
    if (stages.length === 0) {
      toast.warning('At least one clearance stage is required');
      return;
    }

    try {
      setSaving(true);
      if (activeTemplate?._id) {
        await workflowService.updateTemplate(activeTemplate._id, {
          name: templateName,
          description: templateDescription,
          stages
        });
        toast.success('Workflow template updated successfully!');
      } else {
        const res = await workflowService.createTemplate({
          name: templateName,
          description: templateDescription,
          processType: 'OFFBOARDING',
          isActive: true,
          stages
        });
        toast.success('New workflow template created!');
        if (res.data) setActiveTemplate(res.data);
      }
      fetchTemplates();
    } catch (err) {
      toast.error(err.message || 'Failed to save workflow template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>Loading workflow configuration...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            Workflow Template Designer
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Configure approval stages, parallel execution groups, dependency rules, and department checklists
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleOpenAddStage}>
            <Plus size={16} /> Add Stage
          </button>
          <button className="btn btn-primary" onClick={handleSaveWorkflow} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>
      </div>

      {/* Template Info Card */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Workflow Template Name *</label>
            <input
              type="text"
              className="form-input"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Standard Employee Offboarding Pipeline"
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Process Description</label>
            <input
              type="text"
              className="form-input"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Brief description of when this workflow applies..."
            />
          </div>
        </div>
      </div>

      {/* Live Pipeline Preview */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 0 }}>
          <div>
            <h2 className="card-title">Configured Pipeline Preview</h2>
            <p className="card-subtitle">Visual representation of the clearance sequence</p>
          </div>
        </div>

        <StageTimeline
          stages={stages.map((s) => ({
            ...s,
            status: 'WAITING'
          }))}
        />
      </div>

      {/* Stage Definitions List */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Configured Workflow Stages ({stages.length})</h2>
            <p className="card-subtitle">
              Reorder, modify execution type, edit checklists, and map dependency chains
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stages.map((stage, idx) => {
            const isParallel = stage.executionType === 'PARALLEL';
            const depNames = (stage.dependsOn || [])
              .map((depId) => {
                const match = stages.find((s) => s.stageId === depId);
                return match ? match.name : depId;
              })
              .join(', ');

            return (
              <div
                key={stage.stageId || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  gap: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Left: Reorder & Order Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '2px 6px', height: '22px' }}
                      disabled={idx === 0}
                      onClick={() => handleMoveStage(idx, -1)}
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '2px 6px', height: '22px' }}
                      disabled={idx === stages.length - 1}
                      onClick={() => handleMoveStage(idx, 1)}
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>

                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#eef2ff',
                      color: '#4338ca',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px'
                    }}
                  >
                    {stage.order || idx + 1}
                  </div>
                </div>

                {/* Center: Stage Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {stage.name}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: isParallel ? '#e0f2fe' : '#f1f5f9',
                        color: isParallel ? '#0369a1' : '#475569',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {stage.executionType}
                    </span>
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Role: <strong style={{ color: '#334155' }}>{stage.role?.replace('_', ' ')}</strong> •{' '}
                    <span>{stage.checklist?.length || 0} checklist items</span> •{' '}
                    <span>Deadline: {stage.deadlineHours || 48}h</span>
                  </div>

                  {depNames && (
                    <div style={{ fontSize: '11.5px', color: '#6366f1', marginTop: '4px' }}>
                      <strong>Depends on:</strong> {depNames}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenEditStage(idx)}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#dc2626' }}
                    onClick={() => handleDeleteStage(idx)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit / Add Stage Modal */}
      <Modal
        isOpen={showStageModal}
        onClose={() => setShowStageModal(false)}
        title={editingStageIndex !== null ? 'Edit Stage Definition' : 'Add Workflow Stage'}
        maxWidth="650px"
      >
        <form onSubmit={handleSaveStageModal}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Stage Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Project & Reporting Manager Clearance"
                value={stageForm.name}
                onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Assigned Approver Role *</label>
                <select
                  className="form-select"
                  value={stageForm.role}
                  onChange={(e) => setStageForm({ ...stageForm, role: e.target.value })}
                  required
                >
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN_SYSTEMS">Admin & Systems (IT)</option>
                  <option value="ACCOUNTS">Accounts & Finance</option>
                  <option value="PERSONNEL">Personnel & Facilities</option>
                  <option value="HR">HR Final Clearance</option>
                  <option value="HR_ADMIN">HR Admin</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Execution Mode *</label>
                <select
                  className="form-select"
                  value={stageForm.executionType}
                  onChange={(e) => setStageForm({ ...stageForm, executionType: e.target.value })}
                  required
                >
                  <option value="PARALLEL">PARALLEL (Runs concurrently)</option>
                  <option value="SEQUENTIAL">SEQUENTIAL (Waits for dependencies)</option>
                </select>
              </div>
            </div>

            {/* Dependencies Selector */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Stage Dependencies (Must complete before this stage activates)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '8px', borderRadius: '8px' }}>
                {stages
                  .filter((s) => s.stageId !== stageForm.stageId)
                  .map((otherStage) => {
                    const isChecked = (stageForm.dependsOn || []).includes(otherStage.stageId);
                    return (
                      <label key={otherStage.stageId} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const newDeps = e.target.checked
                              ? [...(stageForm.dependsOn || []), otherStage.stageId]
                              : (stageForm.dependsOn || []).filter((id) => id !== otherStage.stageId);
                            setStageForm({ ...stageForm, dependsOn: newDeps });
                          }}
                        />
                        <span>{otherStage.name} ({otherStage.role})</span>
                      </label>
                    );
                  })}
              </div>
            </div>

            {/* Checklist Builder */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Checklist Items for Approver</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Laptop & Charger returned"
                  value={newChecklistLabel}
                  onChange={(e) => setNewChecklistLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                />
                <button type="button" className="btn btn-secondary" onClick={handleAddChecklistItem}>
                  Add Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(stageForm.checklist || []).map((chk, chkIdx) => (
                  <div
                    key={chkIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}
                  >
                    <span>• {chk.label}</span>
                    <button
                      type="button"
                      style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                      onClick={() => handleRemoveChecklistItem(chkIdx)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowStageModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Stage
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
