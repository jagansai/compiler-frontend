import type { FC } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Box, Typography } from '@mui/material';

interface OutputPaneProps {
    output: string;
    title?: string;
}

const OutputPane: FC<OutputPaneProps> = ({ output, title }) => {
    return (
        <Box sx={{ height: '100%', border: '1px solid #ccc', display: 'flex', flexDirection: 'column' }}>
            {title && (
                <Box sx={{ bgcolor: '#1e1e1e', color: '#ccc', px: 2, py: 0.5, borderBottom: '1px solid #444' }}>
                    <Typography variant="body2">{title}</Typography>
                </Box>
            )}
            <Box sx={{ flexGrow: 1 }}>
                <MonacoEditor
                    height="100%"
                    defaultLanguage="plaintext"
                    value={output}
                    theme="vs-dark"
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'off',
                        wordWrap: 'off',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        renderWhitespace: 'none',
                    }}
                />
            </Box>
        </Box>
    );
};

export default OutputPane;
