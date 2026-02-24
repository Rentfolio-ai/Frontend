/**
 * Vasthu Vision — PDF Report Generator
 *
 * Generates a branded PDF report from a Vision analysis result.
 * Uses jsPDF for PDF generation (html2canvas for image embedding).
 *
 * This service can be dynamically imported to avoid bundling jsPDF
 * for users who don't need it.
 */

// ── Types (matching VisionPage) ──────────────────────────────

interface Detection {
  damage_class: string;
  severity: string;
  confidence: number;
  bbox: number[];
}

interface RepairEstimate {
  category: string;
  repair_type: string;
  description: string;
  quantity: number;
  unit: string;
  basic_cost: number;
  standard_cost: number;
  premium_cost: number;
}

interface AnalysisResult {
  room_type: string;
  room_confidence: number;
  condition: string;
  condition_confidence: number;
  detections: Detection[];
  renovation_costs: {
    basic_refresh: number;
    standard_rental: number;
    premium_upgrade: number;
    region: string;
    regional_multiplier: number;
    repairs: RepairEstimate[];
  };
  investment_metrics: {
    deal_score: number;
    value_add_potential: number;
    brrrr_viable: boolean;
    risk_level: string;
    recommended_strategy: string;
    estimated_arv: number | null;
    reasoning: string;
  };
  summary: string;
  model_version: string;
  inference_time_ms: number;
  analysis_id?: string;
}

// ── Helpers ──────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDamageClass(cls: string): string {
  return cls.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getConditionEmoji(condition: string): string {
  const map: Record<string, string> = {
    excellent: '🟢',
    good: '🟡',
    fair: '🟠',
    poor: '🔴',
    critical: '⛔',
  };
  return map[condition] || '⚪';
}

// ── PDF Generation ───────────────────────────────────────────

/**
 * Generate a branded PDF report from a Vision analysis result.
 *
 * Dynamically imports jsPDF to keep bundle size small.
 */
export async function generateVisionPDF(
  result: AnalysisResult,
  capturedImage?: string | null,
): Promise<void> {
  // Dynamic import — only loaded when user requests PDF
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // ── Header ─────────────────────────────────────────────

  doc.setFillColor(15, 15, 20);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(167, 139, 250); // violet-400
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Vasthu Vision', margin, y);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Property Analysis Report', margin, y + 8);

  doc.setTextColor(150, 150, 160);
  doc.setFontSize(8);
  doc.text(
    `Generated: ${new Date().toLocaleDateString()} · Model: ${result.model_version}`,
    margin,
    y + 14,
  );

  y = 45;

  // ── Captured image (if available) ──────────────────────

  if (capturedImage) {
    try {
      doc.addImage(capturedImage, 'JPEG', margin, y, 60, 45);
      // Put summary next to the image
      const textX = margin + 65;

      doc.setTextColor(80, 80, 90);
      doc.setFontSize(9);
      doc.text('Room Type', textX, y + 5);
      doc.setTextColor(30, 30, 40);
      doc.setFontSize(12);
      doc.text(formatDamageClass(result.room_type), textX, y + 12);

      doc.setTextColor(80, 80, 90);
      doc.setFontSize(9);
      doc.text('Condition', textX, y + 22);
      doc.setTextColor(30, 30, 40);
      doc.setFontSize(12);
      doc.text(
        `${getConditionEmoji(result.condition)} ${result.condition.charAt(0).toUpperCase() + result.condition.slice(1)}`,
        textX,
        y + 29,
      );

      doc.setTextColor(80, 80, 90);
      doc.setFontSize(9);
      doc.text('Issues Detected', textX, y + 39);
      doc.setTextColor(30, 30, 40);
      doc.setFontSize(12);
      doc.text(String(result.detections.length), textX, y + 46);

      y += 55;
    } catch {
      // Image embedding failed — continue without it
      y += 5;
    }
  }

  // ── Deal Score ─────────────────────────────────────────

  y += 5;
  doc.setFillColor(245, 245, 248);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 25, 3, 3, 'F');

  doc.setTextColor(30, 30, 40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Deal Score', margin + 5, y + 8);

  doc.setFontSize(22);
  doc.setTextColor(
    result.investment_metrics.deal_score >= 70
      ? 34
      : result.investment_metrics.deal_score >= 40
      ? 202
      : 239,
    result.investment_metrics.deal_score >= 70
      ? 197
      : result.investment_metrics.deal_score >= 40
      ? 138
      : 68,
    result.investment_metrics.deal_score >= 70
      ? 94
      : result.investment_metrics.deal_score >= 40
      ? 4
      : 68,
  );
  doc.text(
    `${result.investment_metrics.deal_score}/100`,
    pageWidth - margin - 5,
    y + 16,
    { align: 'right' },
  );

  y += 30;

  // ── Renovation Costs ───────────────────────────────────

  doc.setTextColor(30, 30, 40);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Renovation Cost Estimates', margin, y + 5);
  y += 10;

  const tiers = [
    { label: 'Basic Refresh', value: result.renovation_costs.basic_refresh },
    { label: 'Standard Rental', value: result.renovation_costs.standard_rental },
    { label: 'Premium Upgrade', value: result.renovation_costs.premium_upgrade },
  ];

  const colWidth = (pageWidth - 2 * margin) / 3;
  tiers.forEach((tier, i) => {
    const x = margin + i * colWidth;
    doc.setFillColor(248, 248, 252);
    doc.roundedRect(x + 1, y, colWidth - 2, 18, 2, 2, 'F');

    doc.setTextColor(100, 100, 110);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(tier.label, x + colWidth / 2, y + 6, { align: 'center' });

    doc.setTextColor(30, 30, 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(tier.value), x + colWidth / 2, y + 14, { align: 'center' });
  });

  y += 25;

  // ── Individual repairs ─────────────────────────────────

  if (result.renovation_costs.repairs.length > 0) {
    doc.setTextColor(80, 80, 90);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Repair Breakdown', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    result.renovation_costs.repairs.forEach((repair) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(60, 60, 70);
      doc.text(repair.description, margin + 2, y);
      doc.setTextColor(30, 30, 40);
      doc.text(formatCurrency(repair.standard_cost), pageWidth - margin, y, {
        align: 'right',
      });
      y += 5;
    });

    y += 5;
  }

  // ── Detected Issues ────────────────────────────────────

  if (result.detections.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(30, 30, 40);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Detected Issues', margin, y);
    y += 7;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    result.detections.forEach((det) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      const sevColor: Record<string, [number, number, number]> = {
        critical: [239, 68, 68],
        high: [249, 115, 22],
        medium: [234, 179, 8],
        low: [34, 197, 94],
      };
      const [r, g, b] = sevColor[det.severity] || [150, 150, 150];
      doc.setTextColor(r, g, b);
      doc.text(`● ${det.severity.toUpperCase()}`, margin + 2, y);

      doc.setTextColor(60, 60, 70);
      doc.text(
        formatDamageClass(det.damage_class),
        margin + 22,
        y,
      );

      doc.setTextColor(150, 150, 160);
      doc.text(`${(det.confidence * 100).toFixed(0)}%`, pageWidth - margin, y, {
        align: 'right',
      });
      y += 5;
    });

    y += 5;
  }

  // ── Investment Metrics ─────────────────────────────────

  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(30, 30, 40);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Investment Analysis', margin, y);
  y += 8;

  const metrics = [
    ['Risk Level', result.investment_metrics.risk_level],
    ['Value-Add Potential', `${(result.investment_metrics.value_add_potential * 100).toFixed(0)}%`],
    ['BRRRR Viable', result.investment_metrics.brrrr_viable ? 'Yes' : 'No'],
    ...(result.investment_metrics.estimated_arv
      ? [['Estimated ARV', formatCurrency(result.investment_metrics.estimated_arv)]]
      : []),
  ];

  doc.setFontSize(9);
  metrics.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 110);
    doc.text(label, margin + 2, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 40);
    doc.text(value, pageWidth - margin, y, { align: 'right' });
    y += 6;
  });

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 70);

  const strategyLines = doc.splitTextToSize(
    `Strategy: ${result.investment_metrics.recommended_strategy}`,
    pageWidth - 2 * margin - 4,
  );
  doc.text(strategyLines, margin + 2, y);

  // ── Footer ─────────────────────────────────────────────

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(180, 180, 190);
    doc.setFontSize(7);
    doc.text(
      `Vasthu Vision · Confidential · Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' },
    );
  }

  // ── Save ───────────────────────────────────────────────

  const filename = `vasthu-vision-${result.room_type}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
