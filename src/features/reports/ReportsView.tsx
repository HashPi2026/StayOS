import React, { useState } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const ReportsView: React.FC = () => {
  const { currentProperty, currentPropertyId, addToast } = useProperty();

  const [selectedReport, setSelectedReport] = useState<
    'MANAGER_FLASH' | 'ARRIVALS_DEPARTURES' | 'REVENUE_BY_ROOM' | 'TAX_COLLECTIONS'
  >('MANAGER_FLASH');
  const [dateFrom, setDateFrom] = useState('2026-06-29');
  const [dateTo, setDateTo] = useState('2026-07-05');

  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (selectedReport === 'MANAGER_FLASH') {
      csvContent += 'Date,Rooms Available,Rooms Sold,Occupancy %,ADR (INR),RevPAR (INR),Room Revenue (INR)\n';
      csvContent += '2026-06-29,23,17,73.9%,12500,9239,212500\n';
      csvContent += '2026-06-30,23,19,82.6%,12800,10573,243200\n';
      csvContent += '2026-07-01,23,21,91.3%,13500,12326,283500\n';
    } else if (selectedReport === 'ARRIVALS_DEPARTURES') {
      csvContent += 'Booking Ref,Guest Name,Room Number,Type,Check-In,Check-Out,Amount (INR)\n';
      csvContent += 'BK-10001-1001,Elena Rostova,201,Deluxe Ocean,2026-06-29,2026-07-02,42500\n';
      csvContent += 'BK-10001-1002,Klaus Schulze,202,Executive Suite,2026-06-29,2026-07-03,58000\n';
    } else {
      csvContent += 'Category,Total Units,Occupancy %,Gross Revenue (INR),Taxes (INR)\n';
      csvContent += 'Deluxe Rooms,12,83.3%,150000,18000\n';
      csvContent += 'Executive Suites,8,75.0%,180000,21600\n';
      csvContent += 'Presidential Suite,3,66.7%,120000,14400\n';
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedReport}_${dateFrom}_to_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Report exported successfully to CSV', 'success');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
            <span className="material-symbols-outlined text-[28px]">analytics</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Management Reports & Analytics</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                Audit Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Financial reconciliation, daily flash matrix, tax reporting, and operational occupancy statistics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-[#4472C4] hover:bg-[#365cb5] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV / Excel
          </button>
        </div>
      </div>

      {/* Report Controls Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Report Type:</span>
          {[
            { id: 'MANAGER_FLASH', label: 'Daily Flash Report' },
            { id: 'ARRIVALS_DEPARTURES', label: 'Arrivals & Departures' },
            { id: 'REVENUE_BY_ROOM', label: 'Revenue by Category' },
            { id: 'TAX_COLLECTIONS', label: 'Tax & GST Summary' },
          ].map((rep) => (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedReport === rep.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {rep.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold">Date Range:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="p-1.5 border border-slate-200 rounded-lg text-xs"
          />
          <span className="text-slate-400">&rarr;</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="p-1.5 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Report Display Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        {selectedReport === 'MANAGER_FLASH' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Daily Manager Flash Matrix &bull; {currentProperty?.identity?.name || 'Surat Marriott Hotel'}
              </h2>
              <span className="text-xs text-slate-400 font-mono">Currency: INR (₹)</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Operating Date</th>
                  <th className="px-4 py-3 text-center">Total Rooms</th>
                  <th className="px-4 py-3 text-center">Rooms Sold</th>
                  <th className="px-4 py-3 text-center">Occupancy %</th>
                  <th className="px-4 py-3 text-right">ADR</th>
                  <th className="px-4 py-3 text-right">RevPAR</th>
                  <th className="px-4 py-3 text-right">Gross Room Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { date: 'Mon 29 Jun 2026', total: 23, sold: 17, occ: '73.9%', adr: '₹12,500', revpar: '₹9,239', rev: '₹2,12,500' },
                  { date: 'Tue 30 Jun 2026', total: 23, sold: 19, occ: '82.6%', adr: '₹12,800', revpar: '₹10,573', rev: '₹2,43,200' },
                  { date: 'Wed 01 Jul 2026', total: 23, sold: 21, occ: '91.3%', adr: '₹13,500', revpar: '₹12,326', rev: '₹2,83,500' },
                  { date: 'Thu 02 Jul 2026', total: 23, sold: 20, occ: '87.0%', adr: '₹13,200', revpar: '₹11,484', rev: '₹2,64,000' },
                  { date: 'Fri 03 Jul 2026', total: 23, sold: 23, occ: '100.0%', adr: '₹14,900', revpar: '₹14,900', rev: '₹3,42,700' },
                  { date: 'Sat 04 Jul 2026', total: 23, sold: 23, occ: '100.0%', adr: '₹15,200', revpar: '₹15,200', rev: '₹3,49,600' },
                  { date: 'Sun 05 Jul 2026', total: 23, sold: 18, occ: '78.3%', adr: '₹12,500', revpar: '₹9,788', rev: '₹2,25,000' },
                ].map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.date}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{row.total}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">{row.sold}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-700">{row.occ}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium">{row.adr}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium">{row.revpar}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{row.rev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'ARRIVALS_DEPARTURES' && (
          <div className="p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Arrivals & Departures Manifest</h2>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Booking #</th>
                  <th className="px-4 py-3">Guest Name</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Check-In</th>
                  <th className="px-4 py-3">Check-Out</th>
                  <th className="px-4 py-3 text-right">Total Billing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { ref: 'BK-10001-1001', name: 'Elena Rostova-Hughes', room: '201', in: '29-Jun-2026', out: '02-Jul-2026', bill: '₹42,500' },
                  { ref: 'BK-10001-1002', name: 'Klaus Schulze', room: '202', in: '29-Jun-2026', out: '03-Jul-2026', bill: '₹58,000' },
                  { ref: 'BK-10001-1003', name: 'Tariq Al-Rahman', room: '301', in: '29-Jun-2026', out: '01-Jul-2026', bill: '₹34,000' },
                  { ref: 'BK-10001-1004', name: 'Oliver Bennett', room: '302', in: '30-Jun-2026', out: '04-Jul-2026', bill: '₹61,200' },
                ].map((row) => (
                  <tr key={row.ref} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-[#4472C4]">{row.ref}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.name}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">Room {row.room}</td>
                    <td className="px-4 py-3 text-slate-600">{row.in}</td>
                    <td className="px-4 py-3 text-slate-600">{row.out}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{row.bill}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(selectedReport === 'REVENUE_BY_ROOM' || selectedReport === 'TAX_COLLECTIONS') && (
          <div className="p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              {selectedReport === 'REVENUE_BY_ROOM' ? 'Room Category Revenue Summary' : 'State & Central Tax Collections'}
            </h2>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Category / Tax Code</th>
                  <th className="px-4 py-3 text-center">Units Sold</th>
                  <th className="px-4 py-3 text-right">Tax Rate</th>
                  <th className="px-4 py-3 text-right">Taxable Gross</th>
                  <th className="px-4 py-3 text-right">Total Net Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { code: 'CGST - Central GST', units: '124 Room Nights', rate: '6.0%', gross: '₹14,50,000', net: '₹87,000' },
                  { code: 'SGST - Gujarat State GST', units: '124 Room Nights', rate: '6.0%', gross: '₹14,50,000', net: '₹87,000' },
                  { code: 'Luxury Hotel Surcharge (>₹7.5k)', units: '98 Room Nights', rate: '6.0%', gross: '₹12,20,000', net: '₹73,200' },
                  { code: 'F&B Restaurant GST', units: '312 Covers', rate: '5.0%', gross: '₹4,80,000', net: '₹24,000' },
                ].map((row) => (
                  <tr key={row.code} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.code}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{row.units}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">{row.rate}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">{row.gross}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">{row.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
