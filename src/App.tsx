import { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, CircularProgress, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Split from 'react-split';
import Editor from './components/Editor';
import OutputPane from './components/OutputPane';
import { compileCode } from './services/compilerService';
import './App.css';

type Language = 'java' | 'cpp';
type CppCompiler = 'cl' | 'g++';

const DEFAULT_CODE: Record<Language, string> = {
  java: `public class TestClass {
    private int number = 42;
    
    public int getNumber() {
        return number;
    }

    public static void main(String[] args) {
        System.out.println(new TestClass().getNumber());
    }
}`,
  cpp: `#include <cstdio>
int main() {
    int number = 42;
    printf("%d\\n", number);
}`
};

const DEFAULT_COMPILER_OPTIONS: Record<CppCompiler, string> = {
  'cl': '/O2',
  'g++': '-O2'
};

function App() {
  const [language, setLanguage] = useState<Language>('java');
  const [cppCompiler, setCppCompiler] = useState<CppCompiler>('cl');
  const [compilerOptions, setCompilerOptions] = useState<string>(DEFAULT_COMPILER_OPTIONS[cppCompiler]);
  const [code, setCode] = useState<string>(DEFAULT_CODE[language]);
  const [output, setOutput] = useState<string>('Compilation output will appear here...');
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCode(DEFAULT_CODE[newLanguage]);
  };

  const handleCompilerChange = (newCompiler: CppCompiler) => {
    setCppCompiler(newCompiler);
    setCompilerOptions(DEFAULT_COMPILER_OPTIONS[newCompiler]);
  };

  const handleCompile = async () => {
    setIsLoading(true);
    try {
      const response = await compileCode({
        code,
        language,
        ...(language === 'cpp' && {
          compiler: cppCompiler,
          compilerOptions: compilerOptions
        })
      });

      if (response.success) {
        setOutput(response.output || 'Compilation successful but no output generated.');
      } else {
        setOutput(`Error: ${response.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Compiler Explorer
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120, mr: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
            <InputLabel id="language-select-label" sx={{ color: 'white' }}>Language</InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              label="Language"
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              sx={{ color: 'white' }}
            >
              <MenuItem value="java">Java</MenuItem>
              <MenuItem value="cpp">C++</MenuItem>
            </Select>
          </FormControl>
          {language === 'cpp' && (
            <>
              <FormControl size="small" sx={{ minWidth: 120, mr: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
                <InputLabel id="compiler-select-label" sx={{ color: 'white' }}>Compiler</InputLabel>
                <Select
                  labelId="compiler-select-label"
                  value={cppCompiler}
                  label="Compiler"
                  onChange={(e) => handleCompilerChange(e.target.value as CppCompiler)}
                  sx={{ color: 'white' }}
                >
                  <MenuItem value="cl">MSVC</MenuItem>
                  <MenuItem value="g++">G++</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Compiler Options"
                value={compilerOptions}
                onChange={(e) => setCompilerOptions(e.target.value)}
                sx={{
                  mr: 2,
                  minWidth: 150,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'white',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'white',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                }}
              />
            </>
          )}
          <IconButton
            color="inherit"
            onClick={handleCompile}
            disabled={isLoading}
            aria-label="compile"
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : <PlayArrowIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Split
          sizes={[50, 50]}
          minSize={100}
          gutterSize={8}
          className="split"
          style={{ height: '100%' }}
        >
          <div className="split-pane">
            <Editor code={code} onChange={(value) => setCode(value ?? '')} language={language} />
          </div>
          <div className="split-pane">
            <OutputPane output={output} />
          </div>
        </Split>
      </Box>
    </Box>
  );
}

export default App;
