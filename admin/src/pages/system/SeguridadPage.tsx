import { SecurityPage } from '../../modules/system/SecurityPage';
import { PageContainer } from '../../layouts/PageContainer';

export const SeguridadPage = () => (
    <PageContainer sx={{ height: { xs: 'auto', md: 'calc(100vh - 112px)' } }}>
        <SecurityPage />
    </PageContainer>
);
