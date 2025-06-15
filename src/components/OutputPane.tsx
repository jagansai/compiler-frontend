import type { FC } from 'react';
import { Box, Paper } from '@mui/material';

interface OutputPaneProps {
    output: string;
}

const OutputPane: FC<OutputPaneProps> = ({ output }) => {
    return (
        <Box sx={{ height: '100%', border: '1px solid #ccc' }}>
            <Paper
                sx={{
                    height: '100%',
                    bgcolor: '#1e1e1e',
                    color: '#fff',
                    p: 2,
                    overflow: 'auto'
                }}
            >
                <pre
                    style={{
                        margin: 0,
                        padding: 0,
                        fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        whiteSpace: 'pre',
                        tabSize: 4,
                        color: '#d4d4d4',
                        overflowX: 'auto',
                    }}
                >
                    {output}
                </pre>
            </Paper>
        </Box>
    );
};

export default OutputPane;
