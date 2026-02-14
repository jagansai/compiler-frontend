import { useState, useEffect, useRef } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, CircularProgress, Select, MenuItem, FormControl, TextField, Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Split from 'react-split';
import Editor from './components/Editor';
import OutputPane from './components/OutputPane';
import { compileCode, executeCode, fetchCompilerConfig, type CompilerConfigModel, type LanguageConfig, type CompilerInfo } from './services/compilerService';
import './App.css';

function App() {
  const [config, setConfig] = useState<CompilerConfigModel | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageConfig | null>(null);
  const [selectedCompiler, setSelectedCompiler] = useState<CompilerInfo | null>(null);
  const [compilerOptions, setCompilerOptions] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>('Compilation output will appear here...');
  const [executionOutput, setExecutionOutput] = useState<string>('');
  const [showExecutionOutput, setShowExecutionOutput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const lastCompiledCodeRef = useRef<string>('');

  // Fetch config on mount
  useEffect(() => {
    fetchCompilerConfig().then(cfg => {
      setConfig(cfg);
      if (cfg.languages.length > 0) {
        const defaultLang = cfg.languages[0];
        setSelectedLanguage(defaultLang);
        const defaultComp = defaultLang.compilers.find(c => c.default) || defaultLang.compilers[0];
        setSelectedCompiler(defaultComp);
        setCompilerOptions(defaultComp?.defaultArgs || '');
        setCode(defaultLang.defaultCode || '');
      }
    }).catch(err => {
      console.error('Failed to load compiler config:', err);
      setOutput('Error: Failed to load compiler configuration');
    });
  }, []);

  const handleLanguageChange = (languageId: string) => {
    const lang = config?.languages.find(l => l.id === languageId);
    if (lang) {
      setSelectedLanguage(lang);
      const defaultComp = lang.compilers.find(c => c.default) || lang.compilers[0];
      setSelectedCompiler(defaultComp);
      setCompilerOptions(defaultComp?.defaultArgs || '');
      setCode(lang.defaultCode || '');
      setOutput('Compilation output will appear here...');
    }
  };

  const handleCompilerChange = (compilerId: string) => {
    const compiler = selectedLanguage?.compilers.find(c => c.id === compilerId);
    if (compiler) {
      setSelectedCompiler(compiler);
      setCompilerOptions(compiler.defaultArgs || '');
    }
  };

  const handleCompile = async () => {
    if (!selectedLanguage || !selectedCompiler) return;

    // Check if code hasn't changed since last compilation
    if (code === lastCompiledCodeRef.current && lastCompiledCodeRef.current !== '') {
      console.log('Code unchanged, skipping compilation');
      return;
    }

    setIsLoading(true);
    try {
      const response = await compileCode({
        code,
        language: selectedLanguage.id,
        compilerId: selectedCompiler.id,
        ...(selectedLanguage.allowCustomArgs && compilerOptions && { compilerOptions })
      });

      if (response.success) {
        setOutput(response.output || 'Compilation successful but no output generated.');
        lastCompiledCodeRef.current = code;

        // If execution output is enabled, execute the code
        if (showExecutionOutput) {
          await handleExecute();
        }
      } else {
        setOutput(`Error: ${response.error || 'Unknown error occurred'}`);
        setExecutionOutput('');
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setExecutionOutput('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!selectedLanguage || !selectedCompiler) return;

    try {
      const response = await executeCode({
        code,
        language: selectedLanguage.id,
        compilerId: selectedCompiler.id,
        ...(selectedLanguage.allowCustomArgs && compilerOptions && { compilerOptions })
      });

      if (response.success) {
        setExecutionOutput(response.output || 'Program executed successfully but no output generated.');
      } else {
        setExecutionOutput(`Execution Error: ${response.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      setExecutionOutput(`Execution Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };

  if (!config || !selectedLanguage || !selectedCompiler) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Compiler Explorer
          </Typography>

          <Typography variant="body2" sx={{ color: 'white', mr: 1 }}>
            Language:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 100, mr: 3 }}>
            <Select
              value={selectedLanguage.id}
              onChange={(e) => handleLanguageChange(e.target.value)}
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
            >
              {config.languages.map(lang => (
                <MenuItem key={lang.id} value={lang.id}>{lang.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" sx={{ color: 'white', mr: 1 }}>
            Compiler:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120, mr: 3 }}>
            <Select
              value={selectedCompiler.id}
              onChange={(e) => handleCompilerChange(e.target.value)}
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
            >
              {selectedLanguage.compilers.map(comp => (
                <MenuItem key={comp.id} value={comp.id}>{comp.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedLanguage.allowCustomArgs && (
            <>
              <Typography variant="body2" sx={{ color: 'white', mr: 1 }}>
                Options:
              </Typography>
              <TextField
                size="small"
                value={compilerOptions}
                onChange={(e) => setCompilerOptions(e.target.value)}
                sx={{
                  mr: 2,
                  minWidth: 120,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.1)',
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

          <FormControlLabel
            control={
              <Checkbox
                checked={showExecutionOutput}
                onChange={(e) => setShowExecutionOutput(e.target.checked)}
                sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
              />
            }
            label="Output"
            sx={{ color: 'white', mr: 2 }}
          />

          <Tooltip title="Run" arrow>
            <span>
              <IconButton
                color="inherit"
                onClick={handleCompile}
                disabled={isLoading}
                aria-label="compile"
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : <PlayArrowIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Split
          sizes={[50, 50]}
          minSize={200}
          gutterSize={10}
          className="split"
          style={{ height: '100%' }}
        >
          <div className="split-pane">
            <Editor
              code={code}
              onChange={(value) => setCode(value ?? '')}
              language={selectedLanguage.editorLanguage || selectedLanguage.id}
            />
          </div>
          <div className="split-pane" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {showExecutionOutput ? (
              <Split
                direction="vertical"
                sizes={[65, 35]}
                minSize={100}
                gutterSize={10}
                className="split"
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div className="split-pane">
                  <OutputPane output={output} title="Assembly Output" />
                </div>
                <div className="split-pane">
                  <OutputPane output={executionOutput} title="Program Output" />
                </div>
              </Split>
            ) : (
              <OutputPane output={output} title="Assembly Output" />
            )}
          </div>
        </Split>
      </Box>
    </Box>
  );
}

export default App;
