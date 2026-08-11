import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/Layout';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { KpiCard } from './components/KpiCard';
import { RequisitionGrid } from './components/RequisitionGrid';
import { DetailPanel } from './components/DetailPanel';
import { ActionPlans } from './components/ActionPlans';
import { fetchOverview, generateAiInsight } from '../../services/overviewService';
import type { KpiData, KpiCardData, ActiveRequisition, ActivityTimelineEvent, AiInsight, ActionPlan } from '../../types';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export const Overview: React.FC = () => {
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [kpiCards, setKpiCards] = useState<KpiCardData[]>([]);
  const [requisitions, setRequisitions] = useState<ActiveRequisition[]>([]);
  const [activityTimeline, setActivityTimeline] = useState<ActivityTimelineEvent[]>([]);
  const [aiInsight, setAiInsight] = useState<AiInsight | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Plan Dialog State
  const [showDialog, setShowDialog] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [newPlanCategory, setNewPlanCategory] = useState('Retention');
  const [newPlanStatusColor, setNewPlanStatusColor] = useState<string>('primary');
  const toastRef = useRef<any>(null);
  const cachedAiInsightRef = useRef<AiInsight | null>(null);

  const bp = useBreakpoint();

  const kpiCardOrder = ['Total Headcount', 'Open Requisitions', 'Engagement Score', 'Retention Risk'];
  const categories = ['Retention', 'Recruiting', 'Diversity', 'Engagement', 'Operations'];
  const statusColors = [
    { id: 'primary', label: 'Planned' },
    { id: 'success', label: 'On Track' },
    { id: 'warning', label: 'At Risk' },
    { id: 'danger', label: 'Blocked' },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchOverview();
        setKpi(data.kpi);
        setKpiCards(
          [...data.kpiCards].sort((a, b) => {
            const ai = kpiCardOrder.indexOf(a.title);
            const bi = kpiCardOrder.indexOf(b.title);
            const aOrder = ai === -1 ? Number.POSITIVE_INFINITY : ai;
            const bOrder = bi === -1 ? Number.POSITIVE_INFINITY : bi;
            return aOrder - bOrder;
          }),
        );
        setRequisitions(data.requisitions);
        setActivityTimeline(data.activityTimeline);
        cachedAiInsightRef.current = data.aiInsight;
        setActionPlans(data.actionPlans);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <LoadingState height="400px" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!kpi) {
    return null;
  }

  const handleViewRequisition = (req: ActiveRequisition) => {
    // eslint-disable-next-line no-console
    console.log('View requisition:', req.position);
  };

  const openNewPlanDialog = () => {
    setNewPlanTitle('');
    setNewPlanDescription('');
    setNewPlanCategory('Retention');
    setNewPlanStatusColor('primary');
    setShowDialog(true);
  };

  const handleSavePlan = () => {
    if (!newPlanTitle.trim()) return;
    const newPlan: ActionPlan = {
      id: Date.now().toString(),
      title: newPlanTitle.trim(),
      description: newPlanDescription.trim(),
      category: newPlanCategory,
      statusColor: newPlanStatusColor as 'primary' | 'success' | 'warning' | 'danger',
      statusLabel: statusColors.find((s) => s.id === newPlanStatusColor)?.label ?? 'Planned',
      progress: 0,
    };
    setActionPlans((prev) => [newPlan, ...prev]);
    setShowDialog(false);
    if (toastRef.current) {
      toastRef.current.show({
        title: 'Success',
        content: `Action plan "${newPlan.title}" created successfully.`,
        cssClass: 'e-toast-success',
        icon: 'e-success toast-icons',
      });
    }
  };

  return (
    <div className="overview-screen">
      <PageHeader title="Overview" subtitle="Workforce health and key metrics at a glance" />

          {/* KPI Grid */}
          <div className="kpi-grid">
            {kpiCards.map((card) => (
              <KpiCard
                key={card.title}
                title={card.title}
                value={card.value}
                change={card.change}
                trendData={card.trendData}
                context={card.context}
                showProgress={card.showProgress}
                progressValue={card.progressValue}
                target={card.target}
                color={card.color}
                riskThreshold={20}
                riskValue={card.title === 'Retention Risk' ? parseInt(card.value, 10) : undefined}
                // For Retention Risk an UPWARD change is a NEGATIVE outcome,
                // so the delta chip should render in red instead of green.
                invertTrend={card.title === 'Retention Risk'}
                onClick={() => {
                  // eslint-disable-next-line no-console
                  console.log('Drill-down:', card.title);
                }}
              />
            ))}
          </div>
      <div className={`overview-layout ${bp === 'xs' || bp === 'sm' || bp === 'md' ? 'overview-layout--stack' : ''}`}>
        {/* Left Main Content */}
        <div className="overview-main">

          {/* Active Requisitions Section */}
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">ACTIVE REQUISITIONS</h2>
            </div>
            <RequisitionGrid data={requisitions} onView={handleViewRequisition} />
          </div>

          {/* Action Plans Section */}
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">ACTION PLANS</h2>
              <div className="section-actions">
                <ButtonComponent
                  cssClass="e-small e-primary"
                  iconCss="e-icons e-plus"
                  onClick={openNewPlanDialog}
                >
                  <span className="overview-new-plan-label">New Plan</span>
                </ButtonComponent>
              </div>
            </div>
            <ActionPlans data={actionPlans} />
          </div>
        </div>

        {/* New Action Plan Dialog */}
        <DialogComponent
          width="480px"
          visible={showDialog}
          cssClass="overview-new-plan-dialog"
          header="New Action Plan"
          showCloseIcon={true}
          close={() => setShowDialog(false)}
          closeOnEscape={true}
          isModal={true}
          overlayClick={() => setShowDialog(false)}
          buttons={[
            {
              buttonModel: { content: 'Cancel', cssClass: 'e-secondary' },
              click: () => setShowDialog(false),
            },
            {
              buttonModel: { content: 'Save', cssClass: 'e-primary' },
              click: handleSavePlan,
            },
          ]}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-sf-fg-tertiary)' }}>Title</label>
              <TextBoxComponent
                placeholder="Enter plan title..."
                value={newPlanTitle}
                input={() => {}}
                change={(args: any) => setNewPlanTitle(args?.value ?? args?.previousValue ?? '')}
                floatLabelType="Never"
                cssClass="e-outline"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-sf-fg-tertiary)' }}>Description</label>
              <TextBoxComponent
                placeholder="Enter a short description..."
                value={newPlanDescription}
                input={() => {}}
                change={(args: any) => setNewPlanDescription(args?.value ?? args?.previousValue ?? '')}
                floatLabelType="Never"
                cssClass="e-outline"
                multiline={true}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-sf-fg-tertiary)' }}>Category</label>
              <DropDownListComponent
                dataSource={categories}
                value={newPlanCategory}
                change={(args: any) => setNewPlanCategory(args?.value ?? args?.previousValue ?? 'Retention')}
                popupHeight="180px"
                cssClass="e-outline"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-sf-fg-tertiary)' }}>Status</label>
              <DropDownListComponent
                dataSource={statusColors}
                fields={{ text: 'label', value: 'id' }}
                value={newPlanStatusColor}
                change={(args: any) => setNewPlanStatusColor(args?.value ?? args?.previousValue ?? 'primary')}
                popupHeight="180px"
                cssClass="e-outline"
              />
            </div>
          </div>
        </DialogComponent>

        {/* Toast Success Notification */}
        <ToastComponent
          ref={toastRef}
          position={{ X: 'Right', Y: 'Bottom' }}
          timeOut={5000}
          showCloseButton={true}
          cssClass="e-toast-success"
        />

        {/* Right Sidebar */}
        <aside className="overview-sidebar">
          <DetailPanel
            timeline={activityTimeline}
            aiInsight={aiInsight}
            onGenerateInsight={async () => {
              const fallback = cachedAiInsightRef.current!;
              try {
                const generated = await generateAiInsight(fallback.employeeId);
                setAiInsight(generated);
                return generated;
              } catch {
                setAiInsight(fallback);
                return fallback;
              }
            }}
            onDismissInsight={() => setAiInsight(null)}
            onShowToast={(t) =>
              toastRef.current?.show({
                title: t.title,
                content: t.content,
                cssClass: 'e-toast-success',
                icon: 'e-success toast-icons',
              })
            }
          />
        </aside>
      </div>

      <style>{`
        .overview-screen {
          animation: fadeIn 0.3s ease-in;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .overview-screen { animation: none; }
        }

        /* === Base layout (xl, >1280) === */
        .overview-layout {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        .overview-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .overview-sidebar {
          /* Fluid width: scales with the available space, capped so the main
             column never starves. At ~1280px we sit at 320px, at ~1600px ~360px,
             and from ~1900px onward we cap at 400px. The min keeps the panel
             usable on the lg breakpoint. */
          width: clamp(280px, 22vw, 400px);
          flex: 0 0 clamp(280px, 22vw, 400px);
          max-width: 100%;
          position: sticky;
          top: 16px;
          background: var(--color-sf-bg-primary);
          border: 1px solid var(--color-sf-border-secondary);
          border-radius: 12px;
          box-shadow: var(--shadow-default);
          padding: 20px;
        }

        .kpi-grid {
          display: flex;
          gap: 20px;
        }

        .action-plans-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        /* Card style for KPI widgets — matches reference design */
        .kpi-grid .e-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          min-height: 56px;
          border-bottom: 1px solid var(--color-sf-border-tertiary);
          background: linear-gradient(to bottom, var(--color-sf-bg-secondary), var(--color-sf-surface));
        }

        .kpi-grid .e-card-content {
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .kpi-grid .e-card {
          border-radius: 12px !important;
          border: 1px solid var(--color-sf-border-secondary) !important;
          box-shadow: var(--shadow-default) !important;
          transition: box-shadow 0.2s ease, transform 0.2s ease !important;
        }
        .kpi-grid .e-card:hover {
          box-shadow: var(--shadow-md) !important;
          transform: translateY(-1px);
        }

        .section-container {
          background: var(--color-sf-bg-primary);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--color-sf-border-secondary);
          box-shadow: var(--shadow-default);
          transition: box-shadow 0.2s ease;
        }
        .section-container:hover {
          box-shadow: var(--shadow-md);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--color-sf-border-tertiary);
        }

        .section-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-sf-fg-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        /* Grid styling polish */
        .section-container .e-grid {
          border: none !important;
          font-family: inherit !important;
        }
        .section-container .e-grid .e-headercell,
        .section-container .e-grid .e-headercelldiv {
          background: var(--color-sf-bg-secondary-subtle) !important;
          color: var(--color-sf-fg-secondary) !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        .section-container .e-grid .e-rowcell {
          font-size: 13px !important;
          color: var(--color-sf-fg-primary) !important;
        }
        .section-container .e-grid .e-row:hover .e-rowcell {
          background: var(--color-sf-bg-secondary-subtle) !important;
        }

        /* Detail Panel sidebar polish */
        .overview-sidebar .detail-panel {
          gap: 20px !important;
        }

        /* === xxl — >1600 (very wide screens) === */
        @media (min-width: 1601px) {
          .overview-sidebar { padding: 24px; }
          .overview-layout { gap: 32px; }
        }

        /* === lg — 1025–1280 === */
        @media (min-width: 1025px) and (max-width: 1280px) {
          .overview-sidebar { padding: 18px; }
          .kpi-grid { gap: 16px; }
        }

        /* === md — 769–1024 === */
        @media (min-width: 769px) and (max-width: 1024px) {
          .overview-layout { gap: 20px; }
          .overview-sidebar {
            width: 280px;
            flex: 0 0 280px;
            padding: 16px;
          }
          .kpi-grid { gap: 16px; }
          .action-plans-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
          .section-container { padding: 20px; }
        }

        /* === sm — 481–768 === */
        @media (min-width: 481px) and (max-width: 768px) {
          .overview-layout { flex-direction: column; gap: 16px; }
          .overview-main, .overview-sidebar { width: 100%; max-width: 100%; }
          .overview-sidebar { position: static; }
          .kpi-grid { grid-template-columns: 1fr; gap: 16px; }
          .action-plans-grid { grid-template-columns: 1fr; gap: 16px; }
          .section-container { padding: 16px; }
          .section-header { padding: 12px 16px; }
        }

        /* === xs — <=480 === */
        @media (max-width: 480px) {
          .overview-layout { flex-direction: column; gap: 12px; }
          .overview-main, .overview-sidebar { width: 100%; max-width: 100%; }
          .overview-sidebar { position: static; padding: 12px; }
          .kpi-grid { grid-template-columns: 1fr; gap: 12px; }
          .action-plans-grid { grid-template-columns: 1fr; gap: 12px; }
          .section-container { padding: 12px; border-radius: 10px; }
          .section-header {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .section-title { font-size: 11px; }
          .section-actions .e-btn { width: 100%; }
          .overview-new-plan-label { display: none; }
        }

        /* === Syncfusion Dialog — bottom sheet on xs, fluid on sm === */
        @media (max-width: 480px) {
          .overview-new-plan-dialog.e-dialog {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            border-radius: 12px 12px 0 0;
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            transform: none !important;
          }
        }
        @media (min-width: 481px) and (max-width: 768px) {
          .overview-new-plan-dialog.e-dialog { width: 90% !important; max-width: 480px !important; }
        }
        .no-margin {
          margin: 0 !important;
        }
      `}</style>
    </div>
  );
};
