import { makeStyles } from 'tss-react/mui';
import React, { ReactElement } from 'react';

/* Material UI */
import { Paper, Theme } from '@mui/material';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Chip from '@mui/material/Chip';


const colors = ['#965699', '#74B220','#D9D9D9'];

type Props = {
    titulo?: string;
    fecha?: string;
    estado?: string;
    handleClick?: () => void;
};

const TableListItemComponent = ({ titulo, fecha, estado, handleClick  }: Props): ReactElement => {
    const { classes } = useStyles();
    const color = colors[Number(estado==='ENVIADO')] || colors[2];
    return (
        <Paper className={classes.root} variant="elevation" square elevation={3}>
            <Typography className={classes.title} noWrap gutterBottom>{titulo}</Typography>
             <div className={classes.grid}>
                <div className={classes.details}>
                    <div className={classes.subdetails}> 
                        <Typography className={classes.subtitle}>ACCION</Typography> 
                        <IconButton aria-label="download" style={{padding: '4px'}} onClick={handleClick}>
                            <CloudDownloadIcon style={{color: color}} />
                        </IconButton>
                    </div>                   
                    <div className={classes.subdetails}>                    
                        <Typography className={classes.subtitle}>FECHA DE ENTREGA</Typography>
                        <Typography className={classes.subtitle2}>{fecha}</Typography> 
                    </div>  
                    <div className={classes.subdetails}>                        
                        <Typography className={classes.subtitle}>ESTADO</Typography>                    
                        <Chip variant="filled" size="small" label={estado} className={classes.estado} style={{backgroundColor: `${color}`}}/>                       
                    </div>             
                </div>                
            </div>
        </Paper>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    root: {
        display: 'flex',
        padding: theme.spacing(1),
        margin: theme.spacing(1),
        flexDirection: 'column'        
    },
    title:{
        fontWeight: 'bold',
        fontSize: '1.025rem',
        lineHeight: '1.0',
        //padding: theme.spacing(1)
    },
    subtitle:{
        fontWeight: 'lighter',
        fontSize: '0.875rem',
        color: theme.palette.grey[700],
        lineHeight: '1.0',
        fontStretch: 'condensed',
        paddingBottom: theme.spacing(1)

    },
    subtitle2:{
        fontWeight: 'lighter',
        fontSize: '0.875rem',
        color: theme.palette.grey[500],
        lineHeight: '1.0'
    },
    grid:{
        display: 'flex',
        flexDirection:'row',
        width: '100%'
    },
    download:{
        display: 'flex',
        flexDirection:'row',
    },
    details:{
        display: 'flex',
        flexDirection:'row',
        width: '100%',
        justifyContent: 'space-between'
    },    
    subdetails:{
        display: 'flex',
        flexDirection:'column',
        padding: theme.spacing(0,1,0,1)
    },
    estado:{        
        color:'white', 
        borderRadius: '4px',
        width: '80px'
    }    
}));

export default TableListItemComponent;
