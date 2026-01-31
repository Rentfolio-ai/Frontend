import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ClarificationRequest, ClarificationQuestion } from '@/types/chat';

interface ClarificationFormProps {
    request: ClarificationRequest;
    onSubmit: (answers: Record<string, any>) => void;
    isLoading?: boolean;
}

export const ClarificationForm: React.FC<ClarificationFormProps> = ({ request, onSubmit, isLoading }) => {
    // State to track answers: map of questionId -> value
    const [answers, setAnswers] = useState<Record<string, any>>({});

    const handleChange = (id: string, value: any) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(answers);
    };

    // Render different input types
    const renderInput = (q: ClarificationQuestion) => {
        const value = answers[q.id] || q.default_value || '';

        switch (q.type) {
            case 'single_choice':
                return (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {q.options?.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => handleChange(q.id, opt)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${value === opt
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background hover:bg-muted border-input'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                );

            case 'multiple_choice':
                const selected = (Array.isArray(value) ? value : []) as string[];
                return (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {q.options?.map((opt) => {
                            const isSelected = selected.includes(opt);
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                        const newValue = isSelected
                                            ? selected.filter(s => s !== opt)
                                            : [...selected, opt];
                                        handleChange(q.id, newValue);
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${isSelected
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background hover:bg-muted border-input'
                                        }`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleChange(q.id, e.target.value)}
                        className="w-full mt-2 p-2 rounded-md border border-input bg-background"
                        placeholder="Enter a number..."
                    />
                );

            case 'text':
            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChange(q.id, e.target.value)}
                        className="w-full mt-2 p-2 rounded-md border border-input bg-background"
                        placeholder="Type your answer..."
                    />
                );
        }
    };

    return (
        <Card className="w-full max-w-lg border-primary/20 shadow-lg my-4">
            <CardHeader>
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <span>📋</span> {request.reason || "Clarification Needed"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form id="clarification-form" onSubmit={handleSubmit} className="space-y-6">
                    {request.questions.map((q) => (
                        <div key={q.id}>
                            <label className="block text-sm font-medium mb-1">
                                {q.text}
                            </label>
                            {renderInput(q)}
                        </div>
                    ))}
                </form>
            </CardContent>
            <CardFooter className="justify-end">
                <Button
                    type="submit"
                    form="clarification-form"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                >
                    {isLoading ? 'Sending...' : 'Confirm Strategy'}
                </Button>
            </CardFooter>
        </Card>
    );
};
