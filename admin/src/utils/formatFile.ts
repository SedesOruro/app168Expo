import { FileItem } from 'components/core/FormDialog';

export type DocumentoAdjuntoItem = FileItem | string;

export function parseAdjuntos(adjuntos: string): DocumentoAdjuntoItem[] {
    if (!adjuntos || adjuntos === 'null' || adjuntos === '[]') return [];

    try {
        const parsed: unknown = JSON.parse(adjuntos);
        return Array.isArray(parsed) ? parsed as DocumentoAdjuntoItem[] : [];
    } catch (error: unknown) {
        console.log(error);
        return [];
    }
}

export function getAdjuntoFileName(item: DocumentoAdjuntoItem): string {
    if (typeof item === 'string') return item;
    return item.fileName;
}

export function getAdjuntoDisplayName(item: DocumentoAdjuntoItem): string {
    const fileName: string = getAdjuntoFileName(item);
    return fileName.replace(/^[0-9a-fA-F-]{36}-/, '');
}

export function getAdjuntoKey(item: DocumentoAdjuntoItem, index: number): string {
    if (typeof item === 'string') return `${item}-${index}`;
    return item.id;
}

export function buildFileItemFromFileName(fileName: string): FileItem {
    const id: string = fileName.substring(0, 36);

    return {
        id,
        fileName,
        filePath: '',
        fileType: '*'
    };
}

export function normalizeAdjuntosToFileItems(adjuntos: string): FileItem[] {
    const items: DocumentoAdjuntoItem[] = parseAdjuntos(adjuntos);

    return items.map((item: DocumentoAdjuntoItem) => {
        if (typeof item === 'string') {
            return buildFileItemFromFileName(item);
        }

        return item;
    });
}

export function serializeAdjuntosCompact(items: FileItem[]): string {
    return JSON.stringify(items.map((item: FileItem) => item.fileName));
}
