import React, { ReactElement } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { FileItem } from '../FormDialog';
import { Box, Chip, List, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import AttachmentIcon from '@mui/icons-material/Attachment';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

type ActionSearchProps = {
    items: FileItem[] | string;
    variant?: 'preview';
    storageUrl?: string;
};

const FileItemButton = ({ items, variant, storageUrl = '' }: ActionSearchProps): ReactElement => {
    const adjuntos: FileItem[] = typeof items === 'string' ? JSON.parse(items) : items;
    const { classes } = useStyles();

    const handleClick = (fileItem: FileItem) => {
        const FILE_URL = fileItem.filePath || `${storageUrl}/${fileItem.fileName}`.replace(/^\/+/, '/');
        window.open(FILE_URL);
    };

    const truncateText = (text: string, max: number = 20) => {
        if (text.length <= max) return text;
        const middle = parseInt(`${max / 2}`);
        const a = text.substr(0, middle);
        const b = text.substr(text.length - middle);
        const truncated = `${a} ... ${b}`;
        return truncated;
    };

    const getExt = (fileName: string): string => {
        const dotIndex = fileName.indexOf('.');
        if (dotIndex > -1) {
            return (fileName.split('.').pop() || '').toUpperCase();
        }
        return '';
    };

    const renderIcon = (fileItem: FileItem) => {
        const EXT = getExt(fileItem.fileName);
        const esImagen = ['PNG', 'JPG', 'WEBP', 'JPEG'].includes(EXT);
        const esPdf = EXT === 'PDF';
        const esWord = ['DOC', 'DOCX'].includes(EXT);
        const esTexto = EXT === 'TXT';
        if (esImagen) return <ImageOutlinedIcon />;
        if (esPdf) return <PictureAsPdfOutlinedIcon />;
        if (esWord) return <DescriptionOutlinedIcon />;
        if (esTexto) return <InsertDriveFileOutlinedIcon />;
        return <AttachmentIcon />;
    };

    if (variant === 'preview') {
        return (
            <div className={classes.root}>
                <List>
                    {adjuntos.map((item) => {
                        return (
                            <ListItemButton
                                key={item.id}
                                style={{ width: '100%', overflow: 'hidden' }}
                                onClick={() => handleClick(item)}
                            >
                                <ListItemAvatar>{renderIcon(item)}</ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" noWrap>
                                            <strong>{item.fileName.replace(`${item.id}-`, '')}</strong>
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body2" noWrap>
                                            Descargar
                                        </Typography>
                                    }
                                />
                            </ListItemButton>
                        );
                    })}
                </List>
            </div>
        );
    }

    return (
        <div className={classes.root}>
            {adjuntos.map((item) => {
                return (
                    <Box key={item.id} className={classes.itemContainer}>
                        <Chip
                            className={classes.chip}
                            size="small"
                            label={truncateText(item.fileName.replace(`${item.id}-`, ''))}
                            variant="outlined"
                            onClick={() => handleClick(item)}
                            icon={renderIcon(item)}
                        />
                    </Box>
                );
            })}
        </div>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    root: {
        width: '100%',
        overflow: 'auto',
    },
    itemContainer: {
        float: 'left',
        padding: '5px 5px 5px 0',
    },
    chip: {
        zIndex: 2,
    },
}));

export default FileItemButton;
