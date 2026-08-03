import { ReactElement } from 'react';

export interface MyFormModel {
    [key: string]: string | number | boolean | null | (string | number | boolean | null)[];
}

export interface MyFormParams {
    [key: string]: any[];
}

export type FormValue = {
    [key: string]: string | number | boolean | null | (string | number | boolean | null)[];
};

export type FormDialogProps = {
    addTitle?: string;
    editTitle?: string;
    open: boolean;
    initialValues: FormModel;
    formLayout: FormGroup<FormModel>[];
    validationSchema: yup.ObjectSchemaDefinition;
    labelAceptar?: string;
    labelCancelar?: string;
    isEdit?: boolean;
    debug?: boolean;
    validateOnChange?: boolean; 
    validateOnBlur?: boolean;   
    statusBar?: (formik: FormikProps<MyFormModel>) => ReactElement;
    headerComponent?: (formik: FormikProps<MyFormModel>) => ReactElement;
    onSubmit: (formValue: FormValue) => Promise<void>;
    onCancel: () => void;
};

export type FormDialogRefProps = {
    isPrepared: () => boolean;
};

export type SelectOption = {
    value: string | number;
    label: string;
    caption?: string;
};

export type SelectOption2 = {
    value: string | number;
    label: string;
    caption?: string;
    usuarioId?:string;
};
export type SelectOptionFecha = {
    value: date;
    label: string;
    caption?: string;
};
export type FileItem = {
    id: string;
    fileName: string;
    filePath: string;
    fileType: string; // All types: https://www.freeformatter.com/mime-types-list.html
    fileObject?: { file: File };
};

export type OnChangeFunction = (value: string | number | boolean | null | (string | number | boolean | null)[], formik?: FormikProps<MyFormModel>, fieldValue?: unknown) => void | Promise<void>;
export type OnSaveDataFunction = (value: T[]) => void

export type FormControl<FormModel> = {
    model?: T;
    name?: keyof FormModel;
    label?: string;
    type:
        | 'empty'
        | 'text'
        | 'label'
        | 'select'
        | 'autocomplete'
        | 'password'
        | 'multiselect'
        | 'multiselect2'
        | 'dropzone'
        | 'editor'
        | 'chip'
        | 'date'
        | 'time'
        | 'datetime'
        | 'checkbox'
        | 'checkbox-group'
        | 'radio-group'
        | 'grid'
        | 'textarea';

    disabled?: boolean;
    hidden?: boolean | ((formValue: FormValue) => boolean);
    infoText?: string;
    variant?: 'filled' | 'standard' | 'outlined';

    // for dependency between fields
    fieldRequired?: keyof FormModel;

    // for textfield
    delay?: number;

    // for more control
    onChange?: OnChangeFunction;

    //for grid
    optionsModel?: any[];
    onSaveData?: OnSaveDataFunction;
    data?: T[];

    // for select
    options?: SelectOption[] | ((formValue: FormValue) => SelectOption[]);

    // for dropzone
    filesLimit?: number;
    filesExt?: string[];
    acceptedFiles?: string[];
    maxFileSize?: number;
    dropzoneText?: string;

    // for dateTimePicker
    disablePast?: boolean;
    format?: string;
    ampm?: boolean;

    // for textarea
    rows?: number;

    // for checkbox and radio
    inlineDisplay?: boolean;

    // for TextField
    inputType?: 'text' | 'number';
    upperCaseOn?: boolean;
};

export type FormRow<FormModel> = FormControl<FormModel>[];

export type FormGroup<FormModel> = {
    title: string;
    grid: FormRow<FormModel>[];
};

export type RefreshResultBase<M, P> = { model?: M; params?: P } | undefined;
export type FormDialogPropsV2 = {
    addTitle?: string;
    editTitle?: string;
    formLayout: FormGroup<FormModel>[] | ((params?: FormParams) => FormGroup<FormModel>[]);
    validationSchema: yup.ObjectSchemaDefinition;
    labelAceptar?: string;
    labelCancelar?: string;
    debug?: boolean;
    statusBar?: (formik: FormikProps<MyFormModel>) => ReactElement;
    headerComponent?: (formik: FormikProps<MyFormModel>) => ReactElement;
    refresh: (data?: RefreshParams) => Promise<RefreshResultBase<M, P>>;
    submit: (formValue: FormModel, data: RefreshParams) => Promise<boolean>;
};

export type FormDialogPropsV3 = {
    addTitle?: string;
    editTitle?: string;
    validationSchema: yup.ObjectSchemaDefinition;
    labelAceptar?: string;
    labelCancelar?: string;
    labelGuardar?: string;
    debug?: boolean;
    statusBar?: (formik: FormikProps<MyFormModel>) => ReactElement;
    headerComponent?: (formik: FormikProps<MyFormModel>) => ReactElement;
    refresh: (data?: RefreshParams) => Promise<RefreshResultBase<M, P>>;
    submit: (formValue: FormModel, data: RefreshParams) => Promise<boolean>;
    dialogContent: (formik: FormikProps<MyFormModel>, params?: FormParams) => ReactElement;
    disableSave?: boolean;
    disableSend?: boolean;
};

export type FormDialogPropsV4 = {
    title?: string;
    subtitle?: string;
    refresh: (data?: RefreshParams) => Promise<RefreshResultBase<unknown, P>>;
    dialogContent: (params?: FormParams) => ReactElement;
};

export type FormOptions = {
    isEdit?: boolean;
    data?: RefreshParams;
    onComplete?: (formValue: FormModel) => void;
    onCancel?: () => void;
};

export type FormOptionsV3 = {
    isEdit?: boolean;
    data?: RefreshParams;
    onSend?: (formValue: FormModel) => void;
    onClose?: () => void;
    onSave?: (formValue: FormModel) => void;
};

export type FormOptionsV4 = {
    data?: RefreshParams;
    onComplete?: () => void;
};

export type FormDialogRefPropsV2 = {
    open: (options?: FormOptions) => void;
    getOptions: () => FormOptions;
};

export type FormDialogRefPropsV4 = {
    open: (options?: FormOptionsV4) => void;
    getOptions: () => FormOptionsV4;
};
