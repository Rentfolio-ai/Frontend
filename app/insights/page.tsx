import React from 'react';

const demoInsights = [
	{
		title: 'Market Sentiment',
		value: 'Neutral',
		confidence: '75%',
		description:
			'Continue monitoring market conditions for optimal entry points.',
	},
	{
		title: 'Top Opportunity',
		value: 'Austin, TX',
		confidence: '89%',
		description:
			'AI recommends reviewing undervalued properties in Austin for best ROI.',
	},
];

export default function InsightsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-8 py-8">
			<h1 className="text-3xl font-bold text-white mb-6">Your Insights</h1>
			<div className="grid gap-6">
				{demoInsights.map((insight) => (
					<div
						key={insight.title}
						className="bg-slate-800 rounded-xl p-6 shadow-lg"
					>
						<div className="text-lg font-semibold text-white mb-2">
							{insight.title}
						</div>
						<div className="text-blue-400 text-sm mb-2">
							{insight.value}{' '}
							<span className="text-xs text-gray-400">
								({insight.confidence} confident)
							</span>
						</div>
						<div className="text-gray-300">
							{insight.description}
						</div>
					</div>
				))}
			</div>
			<div className="text-gray-400 text-xs text-center mt-10">
				Demo data shown. Connect your account to see your real insights.
			</div>
		</div>
	);
}
