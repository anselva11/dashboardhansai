import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

export default function ExportButton({ title = 'Export', filename = 'hansai_export', headers = [], data = [], orientation = 'portrait' }) {
  const [open, setOpen] = useState(false);

  const exportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');

      worksheet.columns = headers.map((h) => ({
        header: h.label,
        key: h.key,
        width: Math.max(15, h.label.length + 5),
      }));

      // Header row styling
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF102A43' },
      };

      data.forEach((row) => {
        const rowData = {};
        headers.forEach((h) => {
          rowData[h.key] = typeof h.format === 'function' ? h.format(row[h.key], row) : (row[h.key] ?? '');
        });
        worksheet.addRow(rowData);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
      setOpen(false);
    } catch (err) {
      console.error('Excel export error:', err);
      alert('Failed to generate Excel file.');
    }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF({ orientation });

      // Title & Header branding
      doc.setFontSize(16);
      doc.setTextColor(16, 42, 67); // Navy #102A43
      doc.text('HANSAI SHIPPING LINE', 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Report: ${title} | Generated: ${new Date().toLocaleString()}`, 14, 25);

      const tableHeaders = headers.map((h) => h.label);
      const tableData = data.map((row) =>
        headers.map((h) => (typeof h.format === 'function' ? String(h.format(row[h.key], row)) : String(row[h.key] ?? '')))
      );

      doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: 32,
        theme: 'striped',
        headStyles: { fillColor: [16, 42, 67], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
      });

      doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
      setOpen(false);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF file.');
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-colors"
      >
        <Download className="w-4 h-4 text-slate-500" />
        <span>Export</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95">
          <button
            onClick={exportExcel}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium text-left"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export to Excel (.xlsx)
          </button>
          <button
            onClick={exportPDF}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium text-left"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            Export to PDF (.pdf)
          </button>
        </div>
      )}
    </div>
  );
}

