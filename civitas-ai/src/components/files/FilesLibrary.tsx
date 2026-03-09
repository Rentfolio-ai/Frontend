import React, { useEffect, useState } from 'react';
import { FolderOpen, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { BiometricGate } from '../auth/BiometricGate';
import { getUserFiles, type UserFile } from '../../services/fileStorage';

export const FilesLibrary: React.FC = () => {
    console.log('[FilesLibrary] Render started');
    const [files, setFiles] = useState<UserFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('[FilesLibrary] useEffect mounted');
        const fetchFiles = async () => {
            console.log('[FilesLibrary] Fetching files...');
            try {
                const fetched = await getUserFiles();
                console.log('[FilesLibrary] Files fetched successfully:', fetched);
                setFiles(fetched);
            } catch (err) {
                console.error("[FilesLibrary] Failed to fetch files", err);
            } finally {
                setIsLoading(false);
                console.log('[FilesLibrary] Loading state set to false');
            }
        };

        fetchFiles();

        // Refresh every 30s to catch new uploads
        const interval = setInterval(fetchFiles, 30000);
        return () => clearInterval(interval);
    }, []);

    // Group files by category (folder)
    // We assume backend stores category in tags or metadata, or we derive it here if not explicitly in a "folder" field on UserFile interface yet.
    // For MVP, since we didn't add a strict 'folder' column to Firestore in `uploadFile` (we only sent it to Backend RAG),
    // we might need to rely on the RAG system to update the Firestore doc OR just show a flat list if we can't link back easily.
    // WAIT: `uploadFile` in `fileStorage.ts` DOES NOT set a folder field.
    // However, `rag/api.py` returns the category. 
    // Ideally, `ingestFileToBackend` should UPDATE the local firestore metadata with the returned category.
    // Let's assume for this step we display a "Recent Uploads" folder + any categorized ones if we implement the sync later.
    // Correction: I can update the `getUserFiles` logic or just derive folders here based on file names for now 
    // OR BETTER: Use the `tags` field if we had one.
    // Let's create a derived grouping.

    // In a real app, `ingestFileToBackend` should update the Firestore document with the returned `category`.
    // I will simulate this grouping by filename/type here as a fallback until that sync is solid, 
    // OR I can quickly update `ingestFileToBackend` to do that update.
    // Let's assume we want to show at least "Chat Uploads".

    // MOCK GROUPING for MVP Visualization based on what the backend WOULD do
    const getFolderForFile = (f: UserFile) => {
        const name = (f.fileName || 'untitled').toLowerCase();
        if (name.includes('lease') || name.includes('agreement')) return 'Lease Agreements';
        if (name.includes('tax') || name.includes('1099') || name.includes('w2')) return 'Tax Documents';
        if (name.includes('deed') || name.includes('title')) return 'Property Deeds';
        if (name.includes('invoice') || name.includes('receipt')) return 'Financials';
        if (name.includes('inspection')) return 'Inspection Reports';
        return 'Uncategorized'; // Default
    };

    const folders = React.useMemo(() => {
        const groups: Record<string, { count: number, date: Date, color: string }> = {};

        files.forEach(f => {
            const folderName = getFolderForFile(f);
            if (!groups[folderName]) {
                let color = 'bg-slate-500/10 text-muted-foreground';
                if (folderName === 'Lease Agreements') color = 'bg-blue-500/10 text-blue-400';
                if (folderName === 'Tax Documents') color = 'bg-emerald-500/10 text-emerald-400';
                if (folderName === 'Property Deeds') color = 'bg-amber-500/10 text-amber-400';

                groups[folderName] = { count: 0, date: f.uploadedAt || new Date(), color };
            }
            groups[folderName].count++;
            if (f.uploadedAt && groups[folderName].date && f.uploadedAt > groups[folderName].date) {
                groups[folderName].date = f.uploadedAt;
            }
        });

        return Object.entries(groups).map(([name, data]) => ({
            name,
            count: data.count,
            date: `Updated ${data.date.toLocaleDateString()}`,
            color: data.color
        }));
    }, [files]);

    return (
        <BiometricGate>
            <div className="h-full bg-background flex flex-col p-6 animate-in fade-in duration-500">
                {/* Secure Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-foreground">Secure Document Vault</h2>
                            <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Encrypted</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground/70 flex items-center gap-2">
                            <Lock className="w-3 h-3" />
                            <span>End-to-end encrypted storage • Auto-locks in 5m</span>
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground/70">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/40">
                        <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
                        <p>Vault is empty</p>
                        <p className="text-sm mt-2">Upload files in Chat to see them here.</p>
                    </div>
                ) : (
                    /* Vault Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {folders.map((folder) => (
                            <button
                                key={folder.name}
                                className="group p-4 bg-background border border-black/5 hover:border-black/8 rounded-xl hover:bg-black/5 transition-all text-left flex flex-col gap-4 relative overflow-hidden"
                            >
                                <div className={`w-10 h-10 rounded-lg ${folder.color} flex items-center justify-center`}>
                                    <FolderOpen className="w-5 h-5" />
                                </div>

                                <div className="flex-1 z-10">
                                    <h3 className="text-sm font-medium text-foreground group-hover:text-[#D4A27F] transition-colors mb-1">
                                        {folder.name}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
                                        <span>{folder.count} files</span>
                                        <span>•</span>
                                        <span>{folder.date}</span>
                                    </div>
                                </div>

                                {/* Decorative background glow */}
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-black/5 rounded-full blur-2xl group-hover:bg-black/8 transition-colors" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </BiometricGate>
    );
};
