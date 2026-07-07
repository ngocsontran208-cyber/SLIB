declare module 'react-quill' {
    import * as React from 'react';
    
    export interface UnprivilegedEditor {
        getLength(): number;
        getText(index?: number, length?: number): string;
        getHTML(): string;
        getBounds(index: number, length?: number): any;
        getSelection(focus?: boolean): any;
        getContents(index?: number, length?: number): any;
    }

    export interface ReactQuillProps {
        bounds?: string | HTMLElement;
        children?: React.ReactElement<any>;
        className?: string;
        defaultValue?: string | any;
        formats?: string[];
        id?: string;
        modules?: any;
        onChange?: (content: string, delta: any, source: any, editor: UnprivilegedEditor) => void;
        onChangeSelection?: (selection: any, source: any, editor: UnprivilegedEditor) => void;
        onFocus?: (selection: any, source: any, editor: UnprivilegedEditor) => void;
        onBlur?: (previousSelection: any, source: any, editor: UnprivilegedEditor) => void;
        onKeyDown?: React.EventHandler<any>;
        onKeyPress?: React.EventHandler<any>;
        onKeyUp?: React.EventHandler<any>;
        placeholder?: string;
        preserveWhitespace?: boolean;
        readOnly?: boolean;
        scrollingContainer?: string | HTMLElement;
        style?: React.CSSProperties;
        tabIndex?: number;
        theme?: string;
        value?: string | any;
    }

    export default class ReactQuill extends React.Component<ReactQuillProps> {
        focus(): void;
        blur(): void;
        getEditor(): any;
    }
}
