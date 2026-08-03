import { FileItem } from '../FormDialog';

type DocumentoAdjuntoItem = FileItem | string;

const parseAdjuntos = (adjuntos: string): DocumentoAdjuntoItem[] => {
    if (!adjuntos || adjuntos === 'null' || adjuntos === '[]') return [];

    try {
        const parsed: unknown = JSON.parse(adjuntos);
        return Array.isArray(parsed) ? (parsed as DocumentoAdjuntoItem[]) : [];
    } catch {
        return [];
    }
};

const buildFileItemFromFileName = (fileName: string): FileItem => ({
    id: fileName.substring(0, 36),
    fileName,
    filePath: '',
    fileType: '*'
});

export const getAdjuntoDisplayName = (item: DocumentoAdjuntoItem): string => {
    const fileName = typeof item === 'string' ? item : item.fileName;
    return fileName.replace(/^[0-9a-fA-F-]{36}-/, '');
};

export const normalizeAdjuntosToFileItems = (adjuntos: string): FileItem[] =>
    parseAdjuntos(adjuntos).map((item) => (typeof item === 'string' ? buildFileItemFromFileName(item) : item));
