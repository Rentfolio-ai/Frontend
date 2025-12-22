import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { db, auth, app } from './firebaseAuth';

export interface UserFile {
    id: string;
    userId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    storagePath: string;
    downloadUrl: string;
    chatId: string;
    chatTitle: string;
    conversationTopic?: string;
    propertyAddress?: string;
    uploadedAt: Date;
    tags?: string[];
}

let storage: ReturnType<typeof getStorage> | null = null;

const getStorageInstance = () => {
    if (!storage) {
        try {
            storage = getStorage(app);
        } catch (error) {
            console.error('Firebase Storage initialization error:', error);
            // Return null if Storage isn't configured
            return null;
        }
    }
    return storage;
};

export const uploadFile = async (
    file: File,
    chatContext: {
        chatId: string;
        chatTitle: string;
        conversationTopic?: string;
        propertyAddress?: string;
    },
    onProgress?: (progress: number) => void
): Promise<UserFile> => {
    if (!auth) throw new Error('Firebase Auth not initialized');
    const user = auth.currentUser;
    if (!user) throw new Error('User must be authenticated');

    const storageInstance = getStorageInstance();
    if (!storageInstance) throw new Error('Firebase Storage is not configured');

    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storagePath = `users/${user.uid}/files/${fileName}`;
    const storageRef = ref(storageInstance, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress?.(progress);
            },
            (error) => reject(error),
            async () => {
                try {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    const fileData = {
                        userId: user.uid,
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: file.size,
                        storagePath,
                        downloadUrl,
                        chatId: chatContext.chatId,
                        chatTitle: chatContext.chatTitle,
                        conversationTopic: chatContext.conversationTopic,
                        propertyAddress: chatContext.propertyAddress,
                        uploadedAt: Timestamp.now(),
                        tags: []
                    };
                    if (!db) throw new Error('Firestore not initialized');
                    const docRef = await addDoc(collection(db, 'user_files'), fileData);
                    resolve({ id: docRef.id, ...fileData, uploadedAt: new Date() });
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
};

export const getUserFiles = async (filters?: {
    chatId?: string;
    searchQuery?: string;
}): Promise<UserFile[]> => {
    if (!auth || !db) return [];
    const user = auth.currentUser;
    if (!user) return [];

    let q = query(
        collection(db, 'user_files'),
        where('userId', '==', user.uid),
        orderBy('uploadedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    let files: UserFile[] = [];

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        files.push({
            id: doc.id,
            ...data,
            uploadedAt: data.uploadedAt?.toDate() || new Date()
        } as UserFile);
    });

    if (filters?.chatId) {
        files = files.filter(f => f.chatId === filters.chatId);
    }

    if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        files = files.filter(f =>
            f.fileName.toLowerCase().includes(query) ||
            f.chatTitle?.toLowerCase().includes(query) ||
            f.conversationTopic?.toLowerCase().includes(query) ||
            f.propertyAddress?.toLowerCase().includes(query)
        );
    }

    return files;
};

export const deleteFile = async (fileId: string, storagePath: string): Promise<void> => {
    if (!auth) throw new Error('Firebase Auth not initialized');
    const user = auth.currentUser;
    if (!user) throw new Error('User must be authenticated');

    const storageInstance = getStorageInstance();
    if (!storageInstance) throw new Error('Firebase Storage is not configured');

    if (!db) throw new Error('Firestore not initialized');

    const storageRef = ref(storageInstance, storagePath);
    await deleteObject(storageRef);
    await deleteDoc(doc(db, 'user_files', fileId));
};

export const isSupportedFileType = (file: File): boolean => {
    const supportedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel', 'text/csv'
    ];
    return supportedTypes.includes(file.type);
};

export const isWithinSizeLimit = (file: File): boolean => {
    return file.size <= 10 * 1024 * 1024; // 10MB
};

export const getFileIcon = (fileType: string): string => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('sheet') || fileType.includes('excel') || fileType === 'text/csv') return '📊';
    return '📎';
};
export interface IngestResponse {
    success: boolean;
    document_id: string;
    category: string;
    message: string;
}

export const ingestFileToBackend = async (
    fileData: UserFile
): Promise<IngestResponse> => {
    // Determine backend URL (local dev or prod)
    const backendUrl = '/api/rag/ingest'; // Vite proxy handles this

    try {
        const params = new URLSearchParams({
            file_url: fileData.downloadUrl,
            title: fileData.fileName,
            user_id: fileData.userId,
            document_type: 'user_file',
            metadata: JSON.stringify({
                chatId: fileData.chatId,
                original_filename: fileData.fileName
            })
        });

        const response = await fetch(`${backendUrl}?${params.toString()}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ingestion failed: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Backend ingestion error:', error);
        throw error;
    }
};
