import React from 'react';

const demoReports = [
	{
		title: 'Monthly Performance Report',
		date: 'August 2025',
		summary:
			'Your portfolio grew by 2.4% this month. ROI and cash flow increased across all properties.',
	},
	{
		title: 'AI Investment Analysis',
		date: 'July 2025',
		summary:
			'AI identified 3 new opportunities in your target markets. Review recommended properties for best returns.',
	},
];

export default function ReportsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-8 py-8">
			<h1 className="text-3xl font-bold text-white mb-6">Your Reports</h1>
			<div className="grid gap-6">
				{demoReports.map((report) => (
					<div
						key={report.title}
						className="bg-slate-800 rounded-xl p-6 shadow-lg"
					>
						<div className="text-lg font-semibold text-white mb-2">
							{report.title}
						</div>
						<div className="text-gray-400 text-sm mb-2">
							{report.date}
						</div>
						<div className="text-gray-300">{report.summary}</div>
					</div>
				))}
			</div>
			<div className="text-gray-400 text-xs text-center mt-10">
				Demo data shown. Connect your account to see your real reports.
			</div>
		</div>
	);
}
