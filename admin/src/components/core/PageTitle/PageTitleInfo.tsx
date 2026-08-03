import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogContent, IconButton, Theme, Tooltip, TooltipProps, Typography, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { ReactElement } from 'react';
import InfoIcon from '@mui/icons-material/Info';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    }
}));

export type ModuleInfo = {
    modulo: string;
    escuela?: string;
    nivel?: string;
    turno?: string;
};

type Props = {
    info?: ModuleInfo;
};

export const PageTitleInfo = ({ info }: Props): ReactElement => {
    const { classes } = useStyles();
    const [open, setOpen] = React.useState(false);

    if (!info) return <></>;

    const renderContent = () => {
        return (
            <>
                {info && info.modulo && <Typography variant="body2" gutterBottom sx={{
                    color: "inherit"
                }}><strong>Módulo: </strong>{info.modulo}</Typography>}
                {info && info.escuela && <Typography variant="body2" gutterBottom sx={{
                    color: "inherit"
                }}><strong>Escuela: </strong> {info.escuela}</Typography>}
                {info && info.nivel && <Typography variant="body2" gutterBottom sx={{
                    color: "inherit"
                }}><strong>Nivel: </strong> {info.nivel}</Typography>}
                {info && info.turno && <Typography variant="body2" gutterBottom sx={{
                    color: "inherit"
                }}><strong>Turno: </strong> {info.turno}</Typography>}
            </>
        );
    };

    return (
        <div className={classes.root}>
            <Dialog onClose={() => setOpen(false)} open={open}>
                <DialogContent>{renderContent()}</DialogContent>
            </Dialog>
            <HtmlTooltip title={renderContent()} placement="bottom">
                <IconButton size="small" onClick={() => setOpen(true)}>
                    <InfoIcon color="primary" />
                </IconButton>
            </HtmlTooltip>
        </div>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    root: {
        display: 'inline',
        padding: theme.spacing(0),
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(0),
        },
    },
}));
