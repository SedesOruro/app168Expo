import { Box, Tab, Tabs, useTheme } from '@mui/material';
import React, { forwardRef, ReactElement, useImperativeHandle } from 'react';

export type SectionItem = {
    id: string;
    label: string;
    shortName?: string;
    icon?: string;
    color?: string;
    content: ReactElement;
};

export type SectionNavRefProps = {
    getTabSelected: () => string;
    setTabSelected: (id: string) => void;
};

type Props = {
    sections: SectionItem[];
};

const SectionNavComponent = (props: Props, ref: React.Ref<SectionNavRefProps>): ReactElement => {
    const { sections } = props;
    const theme = useTheme();
    const initialTabSelected = sections.length > 0 ? sections[0].id : '-1';
    const [tabSelected, setTabSelected] = React.useState(initialTabSelected);

    const handleChange = (_evt: React.SyntheticEvent, value: string) => {
        setTabSelected(value);
    };

    useImperativeHandle(
        ref,
        () => ({
            getTabSelected: () => tabSelected,
            setTabSelected: (id: string) => setTabSelected(id)
        }),
        [tabSelected]
    );

    const selectedSection = sections.find((section) => section.id === tabSelected);

    return (
        <div>
            {selectedSection && (
                <>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabSelected} variant="scrollable" onChange={handleChange}>
                            {sections.map((section) => (
                                <Tab
                                    key={section.id}
                                    label={section.label}
                                    value={section.id}
                                    icon={section.icon ? <img src={section.icon} alt="icon" width="32px" /> : undefined}
                                />
                            ))}
                        </Tabs>
                    </Box>
                    <Box sx={{ p: theme.spacing(1) }}>{selectedSection.content}</Box>
                </>
            )}
        </div>
    );
};

export const SectionNav = forwardRef(SectionNavComponent);
