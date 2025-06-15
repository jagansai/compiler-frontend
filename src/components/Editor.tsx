import type { FC } from 'react';
import MonacoEditor from '@monaco-editor/react';
import type { BeforeMount } from '@monaco-editor/react';
import { Box } from '@mui/material';
import type { editor } from 'monaco-editor';

type Language = 'java' | 'cpp';

interface EditorProps {
    code: string;
    onChange: (value: string | undefined) => void;
    language: Language;
}

const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: 'on',
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
    suggestOnTriggerCharacters: true,
    tabSize: 4,
    rulers: [80],
    bracketPairColorization: {
        enabled: true,
    },
    guides: {
        bracketPairs: true,
        indentation: true,
    },
};

const Editor: FC<EditorProps> = ({ code, onChange, language }) => {
    const handleEditorWillMount: BeforeMount = (monaco) => {
        // Configure language features if needed
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        });
    };

    return (
        <Box sx={{ height: '100%', border: '1px solid #ccc' }}>
            <MonacoEditor
                height="100%"
                defaultLanguage={language === 'cpp' ? 'cpp' : 'java'}
                value={code}
                onChange={onChange}
                theme="vs-dark"
                options={editorOptions}
                beforeMount={handleEditorWillMount}
            />
        </Box>
    );
};

export default Editor;
